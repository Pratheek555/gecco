import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attribute,
  parseCampaignInput,
  parseSegmentParams,
  renderMessage,
  templateVariables,
  validateTemplate,
  whatsappLink,
  whatsappNumber,
} from "./shared";

describe("campaign WhatsApp numbers", () => {
  it("adds the Indian country code to local numbers", () => {
    assert.equal(whatsappNumber("98765 43210"), "919876543210");
    assert.equal(whatsappNumber("098765-43210"), "919876543210");
  });

  it("keeps numbers that already carry a country code", () => {
    assert.equal(whatsappNumber("+91 98765 43210"), "919876543210");
    assert.equal(whatsappNumber("919876543210"), "919876543210");
    assert.equal(whatsappNumber("+44 7700 900123"), "447700900123");
    assert.equal(whatsappNumber("0044 7700 900123"), "447700900123");
  });

  it("rejects values that cannot be dialled", () => {
    assert.equal(whatsappNumber(""), null);
    assert.equal(whatsappNumber(null), null);
    assert.equal(whatsappNumber("12345"), null);
    assert.equal(whatsappNumber("not a phone"), null);
  });

  it("encodes the message into the wa.me link", () => {
    assert.equal(whatsappLink("919876543210", "Hi & bye"), "https://wa.me/919876543210?text=Hi%20%26%20bye");
  });
});

describe("campaign templates", () => {
  it("fills known variables and blanks unknown ones", () => {
    assert.equal(renderMessage("Hi {{ name }}, see you at {{gymName}}{{missing}}.", { name: "Neha", gymName: "Iron" }), "Hi Neha, see you at Iron.");
  });

  it("lists each variable once", () => {
    assert.deepEqual(templateVariables("{{name}} {{name}} {{dueAmount}}"), ["name", "dueAmount"]);
  });

  it("rejects variables the audience cannot fill", () => {
    assert.equal(validateTemplate("DUES_OUTSTANDING", "Hi {{name}}, {{dueAmount}} due"), null);
    assert.match(validateTemplate("LOST_LEADS", "Hi {{name}}, your {{planName}}") ?? "", /planName/);
    assert.match(validateTemplate("LOST_LEADS", "   ") ?? "", /Write the message/);
  });
});

describe("campaign input", () => {
  it("defaults segment days and validates their range", () => {
    assert.deepEqual(parseSegmentParams("EXPIRING_SOON", {}), { ok: true, data: { days: 7 } });
    assert.equal(parseSegmentParams("EXPIRING_SOON", { days: 0 }).ok, false);
    assert.deepEqual(parseSegmentParams("DUES_OUTSTANDING", { days: 900 }), { ok: true, data: {} });
  });

  it("accepts lost reasons only for lost leads", () => {
    assert.deepEqual(parseSegmentParams("LOST_LEADS", { reasons: ["PRICE", "PRICE"] }), {
      ok: true,
      data: { days: 90, reasons: ["PRICE"] },
    });
    assert.equal(parseSegmentParams("LOST_LEADS", { reasons: ["CHEAP"] }).ok, false);
  });

  it("parses a complete campaign", () => {
    const parsed = parseCampaignInput({
      name: "  October renewals ",
      segment: "EXPIRING_SOON",
      params: { days: 10 },
      messageTemplate: "Hi {{name}}, {{planName}} ends {{endDate}}",
    });
    assert.deepEqual(parsed, {
      ok: true,
      data: {
        name: "October renewals",
        segment: "EXPIRING_SOON",
        params: { days: 10 },
        messageTemplate: "Hi {{name}}, {{planName}} ends {{endDate}}",
        attributionDays: 7,
      },
    });
    assert.equal(parseCampaignInput({ name: "X", segment: "EXPIRING_SOON", messageTemplate: "Hi" }).ok, false);
    assert.equal(parseCampaignInput({ name: "Promo", segment: "NOPE", messageTemplate: "Hi" }).ok, false);
  });
});

describe("campaign attribution", () => {
  const sentAt = new Date("2026-10-01T10:00:00Z");
  const day = (offset: number) => new Date(sentAt.getTime() + offset * 86_400_000);

  it("credits revenue and conversions inside the window only", () => {
    const result = attribute(sentAt, 7, "membership", [
      { kind: "payment", at: day(-1), amount: 500 },
      { kind: "payment", at: day(2), amount: 3000 },
      { kind: "membership", at: day(2) },
      { kind: "payment", at: day(9), amount: 700 },
    ]);
    assert.deepEqual(result, { converted: true, revenue: 3000 });
  });

  it("counts a conversion only for the campaign's goal", () => {
    assert.equal(attribute(sentAt, 7, "pt", [{ kind: "membership", at: day(1) }]).converted, false);
    assert.equal(attribute(sentAt, 7, "pt", [{ kind: "pt", at: day(1) }]).converted, true);
    assert.equal(attribute(sentAt, 7, "membership", [{ kind: "pt", at: day(1) }]).converted, true);
    assert.equal(attribute(sentAt, 7, "lead", [{ kind: "payment", at: day(1), amount: 100 }]).converted, false);
  });
});
