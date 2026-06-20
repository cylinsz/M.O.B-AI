import { EmbedBuilder } from "discord.js";
import { PRIORITY_MAP } from "../utils/helpers.js";

function calculateTrust(ticketData) {
  let trust = 50;

  const text = (ticketData.reason || "").toLowerCase();

  // lowers trust
  if (text.includes("fake")) trust -= 20;
  if (text.includes("lying")) trust -= 15;
  if (text.includes("scam")) trust -= 25;

  // increases trust
  if (text.includes("proof")) trust += 25;
  if (text.includes("clip")) trust += 20;
  if (text.includes("screenshot")) trust += 20;
  if (text.includes("evidence")) trust += 25;

  // clamp
  if (trust > 100) trust = 100;
  if (trust < 0) trust = 0;

  return trust;
}

function getVerdict(trust) {
  if (trust >= 75) return "🟢 High Credibility";
  if (trust >= 40) return "🟡 Medium Credibility";
  return "🔴 Low Credibility";
}

/**
 * CALL THIS when a ticket is created
 */
export async function sendTicketOverview(client, ticketData, guildId, channelId) {
  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) return;

  const overviewChannel = guild.channels.cache.find(
    (c) => c.name === "ticket-overview"
  );

  if (!overviewChannel) return;

  const trust = calculateTrust(ticketData);
  const verdict = getVerdict(trust);

  const priority = PRIORITY_MAP[ticketData.priority || "none"];

  const embed = new EmbedBuilder()
    .setTitle("📢 New Ticket Overview")
    .setColor(priority?.color || 0x3498db)
    .addFields(
      { name: "User ID", value: ticketData.userId, inline: true },
      { name: "Priority", value: `${priority.emoji} ${priority.label}`, inline: true },
      { name: "Trust Score", value: `${trust}/100`, inline: true },
      { name: "Verdict", value: verdict, inline: false },
      { name: "Reason", value: ticketData.reason?.slice(0, 1000) || "None" }
    )
    .setFooter({ text: `Ticket ID: ${channelId}` });

  await overviewChannel.send({
    content: `<@&YOUR_MOD_ROLE_ID> 🚨 New ticket requires attention`,
    embeds: [embed],
  });
}
