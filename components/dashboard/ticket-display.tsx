"use client";

import { Download, Printer, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

interface TicketDisplayProps {
  ticketNumber: string;
  ticketImage: string;
  eventTitle: string;
}

export function TicketDisplay({
  ticketNumber,
  ticketImage,
  eventTitle,
}: TicketDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(ticketImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticketNumber}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket - ${eventTitle}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .ticket-container {
                text-align: center;
                max-width: 400px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
              }
              .ticket-number {
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0;
              }
              img {
                max-width: 300px;
                height: auto;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              <h1>${eventTitle}</h1>
              <div class="ticket-number">Ticket #${ticketNumber}</div>
              <img src="${ticketImage}" alt="Ticket QR Code" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="rounded-lg border bg-surface-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Ticket Number
          </p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm font-semibold">#{ticketNumber}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="relative h-48 w-48 overflow-hidden rounded-lg border-2 border-border bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticketImage}
            alt={`QR Code for ${eventTitle}`}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex-1"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}