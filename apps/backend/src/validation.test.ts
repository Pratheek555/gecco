import { describe, expect, test } from "bun:test";
import { validateHeaders, validateMemberRow } from "./validation";

describe("member import validation", () => {
  test("accepts the documented header order", () => {
    expect(
      validateHeaders([
        "member_id",
        "full_name",
        "joined_on",
        "status",
        "phone",
        "email",
        "whatsapp",
      ]).errors,
    ).toEqual([]);
  });

  test("reports missing and unsupported columns", () => {
    expect(validateHeaders(["member_id", "full_name", "date"]).errors).toEqual([
      "Missing required column: joined_on.",
      "Unsupported column: date.",
    ]);
  });

  test("requires member ID and full name as the first two columns", () => {
    expect(validateHeaders(["full_name", "member_id", "joined_on"]).errors).toEqual([
      "The first column must be member_id.",
      "The second column must be full_name.",
    ]);
  });

  test("normalizes a valid member row", () => {
    expect(
      validateMemberRow(2, {
        member_id: " MEM-001 ",
        full_name: " Asha Mehta ",
        joined_on: "2026-09-01",
        status: "active",
        email: "ASHA@EXAMPLE.COM",
      }),
    ).toEqual({
      rowNumber: 2,
      data: {
        member_id: "MEM-001",
        full_name: "Asha Mehta",
        joined_on: "2026-09-01",
        status: "ACTIVE",
        phone: "",
        email: "asha@example.com",
        whatsapp: "",
      },
      errors: [],
    });
  });

  test("returns every reason a row must be excluded", () => {
    expect(
      validateMemberRow(
        7,
        {
          member_id: "MEM-001",
          full_name: "",
          joined_on: "04/05/2026",
          status: "paused",
        },
        { duplicateInFile: true, existsInGym: true, containsFormula: true },
      ).errors,
    ).toEqual([
      "Full name is required.",
      "Joined date must use YYYY-MM-DD.",
      "Status must be ACTIVE or ARCHIVED.",
      "Member ID is repeated in this spreadsheet.",
      "Member ID already exists in this gym.",
      "Formula cells are not supported.",
    ]);
  });
});
