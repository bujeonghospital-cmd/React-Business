import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".n_customer';

const CUSTOMER_FIELDS = [
  "recordno",
  "code",
  "cn",
  "prefix",
  "name",
  "surname",
  "nickname",
  "gender",
  "idcard",
  "birthdate",
  "registerdate",
  "member",
  "cusgroup",
  "mobilephone",
  "email",
  "lineid",
  "facebook",
  "medianame",
  "disease",
  "allergic",
  "displayname",
  "locno",
  "soi",
  "road",
  "moo",
  "tumbon",
  "amphur",
  "province",
  "zipcode",
  "address",
  "ownercode",
  "ownername",
  "binddate",
];

const DATE_FIELDS = new Set(["birthdate", "registerdate", "binddate"]);
const AUTO_GENERATED_FIELDS = new Set(["recordno"]);
const IMMUTABLE_FIELDS = new Set(["cn"]);

type CustomerPayload = Partial<Record<(typeof CUSTOMER_FIELDS)[number], any>>;

function sanitizeValue(field: string, value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (DATE_FIELDS.has(field)) {
      return trimmed.slice(0, 10);
    }
    return trimmed;
  }

  return DATE_FIELDS.has(field) ? String(value).slice(0, 10) : value;
}

function buildInsertStatement(payload: CustomerPayload) {
  const columns: string[] = [];
  const values: unknown[] = [];

  CUSTOMER_FIELDS.forEach((field) => {
    if (AUTO_GENERATED_FIELDS.has(field)) {
      return;
    }
    if (payload[field] !== undefined) {
      columns.push(`"${field}"`);
      values.push(sanitizeValue(field, payload[field]));
    }
  });

  if (!columns.includes('"cn"')) {
    throw new Error("Missing required field: cn");
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`);

  const query = `INSERT INTO ${TABLE} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  return { query, values };
}

function buildUpdateStatement(payload: CustomerPayload) {
  if (!payload.cn) {
    throw new Error("Missing required field: cn");
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  CUSTOMER_FIELDS.forEach((field) => {
    if (IMMUTABLE_FIELDS.has(field) || AUTO_GENERATED_FIELDS.has(field)) {
      return;
    }

    if (payload[field] !== undefined) {
      setClauses.push(`"${field}" = $${setClauses.length + 1}`);
      values.push(sanitizeValue(field, payload[field]));
    }
  });

  if (!setClauses.length) {
    return null;
  }

  const cnPlaceholderIndex = values.length + 1;
  const query = `UPDATE ${TABLE} SET ${setClauses.join(", ")} WHERE "cn" = $${cnPlaceholderIndex} RETURNING *`;

  values.push(sanitizeValue("cn", payload.cn));

  return { query, values };
}

function buildDisplayName(data: CustomerPayload) {
  if (data.displayname) {
    return data.displayname;
  }

  const pieces = [data.prefix, data.name, data.surname]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  return pieces.length ? pieces.join(" ") : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cn = searchParams.get("cn");

  if (!cn) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required query parameter: cn",
      },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    const selectColumns = CUSTOMER_FIELDS.map((field) => `"${field}"`).join(", ");
    const result = await client.query(
      `SELECT ${selectColumns} FROM ${TABLE} WHERE "cn" = $1 LIMIT 1`,
      [cn]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, exists: false, data: null });
    }

    return NextResponse.json({ success: true, exists: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching n_customer record:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch n_customer record",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CustomerPayload;

    if (!payload.cn) {
      return NextResponse.json(
        { success: false, error: "Missing required field: cn" },
        { status: 400 }
      );
    }

    payload.displayname = buildDisplayName(payload) ?? undefined;

    const { query, values } = buildInsertStatement(payload);

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);

      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error inserting n_customer record:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to insert n_customer record",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as CustomerPayload;

    if (!payload.cn) {
      return NextResponse.json(
        { success: false, error: "Missing required field: cn" },
        { status: 400 }
      );
    }

    payload.displayname = buildDisplayName(payload) ?? undefined;

    const statement = buildUpdateStatement(payload);

    if (!statement) {
      return NextResponse.json(
        { success: false, error: "No fields provided for update" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(statement.query, statement.values);

      return NextResponse.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error updating n_customer record:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update n_customer record",
      },
      { status: 500 }
    );
  }
}
