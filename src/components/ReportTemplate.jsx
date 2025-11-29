import React from "react";
import { Table, Card, Typography, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

export default function ReportTemplate({ title, columns, data, exportHandler }) {
  return (
    <Card style={{ margin: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3}>{title}</Title>
        {exportHandler && (
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportHandler}>
            Export
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record, index) => record.id || index}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
