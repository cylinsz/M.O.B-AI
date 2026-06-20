import { EmbedBuilder } from "discord.js";
import botConfig from "../../bot.js";

const reports = new Map();

const badKeywords = [
  "exposing",
  "scam",
  "threat",
  "fake",
  "cheating",
  "boosting",
];

export function handleAITickets(message) {
  if (!message.guild || message.author.bot) return;

  const content = message.content.toLowerCase();
  const prefix = botConfig.commands.prefix;

  // ================= REPORT =================
  if (content.startsWith(prefix + "report")) {
    const text = message.content.slice(prefix.length + 6).trim();

    const report = {
      user: message.author.tag,
      content: text,
      time: Date.now(),
      confidence: text.includes("proof") ? "MEDIUM" : "LOW",
    };

    reports.set(Date.now(), report);

    return message.reply(
      `📩 Report received.\nAI Confidence: **${report.confidence}**`
    );
  }

  // ================= STAFF REPORT VIEW =================
  if (content === prefix + "reports") {
    return message.reply(
      [...reports.values()]
        .slice(-10)
        .map((r, i) => `#${i + 1} ${r.user} | ${r.confidence}`)
        .join("\n") || "No reports"
    );
  }

  // ================= AI CHECK =================
  if (content.startsWith(prefix + "check")) {
    let verdict = "Needs review";

    if (content.includes("fake")) verdict = "⚠️ Likely false";
    if (content.includes("proof")) verdict = "✅ Evidence detected";

    return message.reply(`🧠 AI Verdict: **${verdict}**`);
  }

  // ================= AUTO FLAG =================
  if (badKeywords.some((w) => content.includes(w))) {
    const log = message.guild.channels.cache.get(
      botConfig.tickets.logChannel
    );

    if (log) {
      const embed = new EmbedBuilder()
        .setTitle("🚨 Flagged Message")
        .setColor(0xff0000)
        .addFields(
          { name: "User", value: message.author.tag },
          { name: "Message", value: message.content.slice(0, 1000) }
        );

      log.send({ embeds: [embed] });
    }
  }

  if (content === prefix + "status") {
    return message.reply("🧠 M.O.B AI is active.");
  }
}
