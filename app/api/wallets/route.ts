import { NextRequest, NextResponse } from "next/server";
import {
  getAllEmployeeWallets,
  getTasksByEmployee,
  updateEmployeeWallet,
} from "@/lib/db-utils";

/* =====================================================
   GET → Fetch all wallets or single employee wallet
===================================================== */
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Wallets API: Fetching wallets");

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const wallets = await getAllEmployeeWallets();
    console.log("[v0] Wallets API: Wallets found:", wallets.length);

    if (employeeId) {
      const wallet = wallets.find((w) => w.employeeId === employeeId);
      if (!wallet) {
        return NextResponse.json(
          { success: false, error: "Wallet not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: wallet });
    }

    return NextResponse.json({ success: true, data: wallets });
  } catch (error: any) {
    console.error("[v0] Wallets API GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST → calculate | payout
===================================================== */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeId, transactionId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId required" },
        { status: 400 }
      );
    }

    /* =============================
       CALCULATE WALLET (MONTHLY)
    ============================== */
    if (action === "calculate") {
      const tasks = await getTasksByEmployee(employeeId);

      console.log(
        `[v0] Wallet calc started for ${employeeId}, total tasks:`,
        tasks.length
      );

      // 🔥 CURRENT MONTH RANGE
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0
      );
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      let totalEarnings = 0;

      for (const task of tasks) {
        if (task.taskStatus !== "Completed") continue;
        if (!task.workDoneDate) continue;

        const workDoneDate = new Date(task.workDoneDate);

        // ❌ Ignore tasks outside current month
        if (workDoneDate < startOfMonth || workDoneDate > endOfMonth) {
          continue;
        }

        const earning = Number(task.yourProjectEarning || 0);
        totalEarnings += earning;

        console.log(
          "[v0] Wallet include:",
          task.projectName,
          "| Date:",
          workDoneDate.toISOString().split("T")[0],
          "| Earning:",
          earning
        );
      }

      console.log(
        `[v0] Wallet total for ${employeeId} (current month):`,
        totalEarnings
      );

      await updateEmployeeWallet(employeeId, {
        walletBalance: totalEarnings,
        accumulatedEarnings: totalEarnings,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        data: { walletBalance: totalEarnings },
      });
    }

    /* =============================
       PAYOUT WALLET
    ============================== */
    if (action === "payout") {
      if (!transactionId) {
        return NextResponse.json(
          { success: false, error: "transactionId required" },
          { status: 400 }
        );
      }

      const wallets = await getAllEmployeeWallets();
      const wallet = wallets.find((w) => w.employeeId === employeeId);

      if (!wallet || wallet.walletBalance <= 0) {
        return NextResponse.json(
          { success: false, error: "Wallet balance is 0" },
          { status: 400 }
        );
      }

      const payoutAmount = wallet.walletBalance;

      await updateEmployeeWallet(employeeId, {
        walletBalance: 0,
        lastPayoutAmount: payoutAmount,
        lastTransactionId: transactionId,
        lastPayout: new Date(),
        updatedAt: new Date(),
      });

      console.log(
        `[v0] Wallet payout → ${employeeId}, amount:`,
        payoutAmount
      );

      return NextResponse.json({
        success: true,
        message: "Payout successful",
        data: { payoutAmount },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[v0] Wallets API POST error:", error);
    return NextResponse.json( 
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
