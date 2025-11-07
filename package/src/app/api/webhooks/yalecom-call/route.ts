import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook สำหรับรับสาย (Incoming Call)
 * Yalecom จะส่ง webhook มาเมื่อมีสายเข้า
 */

interface YalecomWebhookPayload {
  call_id?: string;
  caller_number?: string;
  callee_number?: string;
  queue_name?: string;
  queue_extension?: string;
  agent_id?: string;
  agent_name?: string;
  call_status?: string;
  timestamp?: string;
  direction?: "inbound" | "outbound";
  event_type?: "call_started" | "call_answered" | "call_ended" | "call_ringing";
}

export async function POST(request: NextRequest) {
  try {
    const payload: YalecomWebhookPayload = await request.json();

    console.log("📞 Webhook received:", payload);

    // ตรวจสอบว่าเป็นสายเข้า (Incoming Call)
    if (
      payload.direction === "inbound" &&
      payload.event_type === "call_ringing"
    ) {
      // บันทึกข้อมูลการรับสาย
      const contactData = {
        id: payload.call_id || `call-${Date.now()}`,
        name: payload.agent_name || "Unknown Agent",
        company: payload.queue_name || "Unknown Queue",
        phone: payload.caller_number || "Unknown",
        email: "",
        status: "received", // แท็กเป็น "รับสาย"
        lastContact: payload.timestamp || new Date().toISOString(),
        notes: `สายเข้าจาก Queue ${payload.queue_extension}`,
        createdAt: new Date().toISOString(),
      };

      // TODO: บันทึกลง Database (Supabase, MongoDB, etc.)
      // await saveContactToDatabase(contactData);

      return NextResponse.json({
        success: true,
        message: "Incoming call webhook processed",
        data: contactData,
      });
    }

    // กรณีสายออก (Outbound Call)
    if (
      payload.direction === "outbound" &&
      payload.event_type === "call_started"
    ) {
      const contactData = {
        id: payload.call_id || `call-${Date.now()}`,
        name: payload.agent_name || "Unknown Agent",
        company: payload.queue_name || "Unknown Queue",
        phone: payload.callee_number || "Unknown",
        email: "",
        status: "outgoing", // แท็กเป็น "โทรออก"
        lastContact: payload.timestamp || new Date().toISOString(),
        notes: `โทรออกจาก Agent ${payload.agent_id}`,
        createdAt: new Date().toISOString(),
      };

      // TODO: บันทึกลง Database
      // await saveContactToDatabase(contactData);

      return NextResponse.json({
        success: true,
        message: "Outbound call webhook processed",
        data: contactData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received but not processed",
      payload,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// รองรับ GET สำหรับทดสอบ
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Yalecom Call Webhook Endpoint",
    endpoints: {
      POST: "/api/webhooks/yalecom-call",
      description: "Receive incoming/outgoing call events from Yalecom",
    },
    supported_events: [
      "call_started",
      "call_answered",
      "call_ended",
      "call_ringing",
    ],
  });
}
