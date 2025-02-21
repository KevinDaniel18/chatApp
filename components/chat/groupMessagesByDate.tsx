import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

export const groupMessagesByDate = (messages: any[]) => {
  const groupedMessages: any = {};

  messages.forEach((message) => {
    if (!message.createdAt) return;

    const messageDate = parseISO(message.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDateOnly = new Date(messageDate.setHours(0, 0, 0, 0));
    const todayOnly = new Date(today.setHours(0, 0, 0, 0));
    const yesterdayOnly = new Date(yesterday.setHours(0, 0, 0, 0));

    let groupLabel = "";

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      groupLabel = "Today";
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      groupLabel = "Yesterday";
    } else {
      groupLabel = format(messageDate, "d 'of' MMMM yyyy", { locale: enUS });
    }

    if (!groupedMessages[groupLabel]) {
      groupedMessages[groupLabel] = [];
    }
    groupedMessages[groupLabel].push(message);
  });

  return groupedMessages;
};
