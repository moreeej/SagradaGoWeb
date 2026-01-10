import React from "react";
import { Badge, Calendar } from "antd";
import dayjs from "dayjs";
import "../styles/custom-calendar.css";

const CustomCalendar = ({ events = [], onEventClick }) => {
  const dateCellRender = (value) => {
    if (!events || events.length === 0) {
      return null;
    }

    const dateStr = dayjs(value).format("YYYY-MM-DD");
    const dayEvents = events.filter((event) => event && event.date === dateStr);

    if (dayEvents.length === 0) {
      return null;
    }

    return (
      <div style={{ minHeight: 50, position: "relative" }}>
        {dayEvents.map((item, index) => {
          let badgeStatus;

          const eventDate = dayjs(item.date);
          const today = dayjs().startOf('day');
          const isPastEvent = eventDate.isBefore(today);

          if (isPastEvent) {
            badgeStatus = "error";
            
          } else if ((item.status || "").toLowerCase() === "confirmed") {
            badgeStatus = "success";

          } else {
            switch (item.type) {
              case "Wedding": badgeStatus = "success"; break;
              case "Baptism": badgeStatus = "processing"; break;
              case "Burial": badgeStatus = "error"; break;
              case "Communion": badgeStatus = "warning"; break;
              case "Confirmation": badgeStatus = "processing"; break;
              case "Event": badgeStatus = "processing"; break;
              case "Activity": badgeStatus = "warning"; break;
              case "Anointing":
              case "Confession":
              default: badgeStatus = "default"; break;
            }
          }

          const displayText = item.title || item.bookingType || item.type;
    
          const truncatedText = displayText.length > 20 ? displayText.substring(0, 17) + "..." : displayText;

          return (
            <Badge
              key={index}
              status={badgeStatus}
              text={truncatedText}
              style={{
                display: "block",
                marginBottom: 2,
                fontSize: "11px",
                cursor: onEventClick ? "pointer" : "default",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (dayEvents.length > 1) {
                  onEventClick && onEventClick(dayEvents, item);
                  
                } else {
                  onEventClick && onEventClick(item);
                }
              }}
              title={displayText} 
            />
          );
        })}
      </div>
    );
  };

  const monthCellRender = (value) => {
    const monthStr = dayjs(value).format("YYYY-MM");
    const monthEventsCount = events.filter((event) =>
      event.date.startsWith(monthStr)
    ).length;

    return monthEventsCount ? (
      <div className="notes-month">
        <section>{monthEventsCount}</section>
        <span>Events</span>
      </div>
    ) : null;
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  return <Calendar cellRender={cellRender} className="custom-calendar" />;
};

export default CustomCalendar;
