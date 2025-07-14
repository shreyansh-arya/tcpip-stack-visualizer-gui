import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock } from "lucide-react";

interface Packet {
  id: number;
  timestamp: number;
  data_in: string;
  checksum_in: string;
  valid_in: boolean;
  data_out: string;
  valid_out: boolean;
  state: string;
  error: boolean;
  expected: string;
  match: boolean;
}

interface WaveformDisplayProps {
  packets: Packet[];
}

export default function WaveformDisplay({ packets }: WaveformDisplayProps) {
  const getSignalLevel = (value: boolean | string, signal: string) => {
    if (signal === "data" && typeof value === "string") {
      return value !== "" ? "high" : "low";
    }
    return value ? "high" : "low";
  };

  const getStateNumber = (state: string) => {
    switch (state) {
      case "IDLE": return 0;
      case "SYN_RECEIVED": return 1;
      case "ACK_RECEIVED": return 2;
      default: return 0;
    }
  };

  const SignalRow = ({ 
    label, 
    values, 
    type = "digital" 
  }: { 
    label: string; 
    values: (boolean | string | number)[]; 
    type?: "digital" | "data" | "state";
  }) => {
    return (
      <div className="flex items-center">
        <div className="w-24 text-xs font-mono text-right pr-2 text-muted-foreground">
          {label}
        </div>
        <div className="flex-1 h-8 bg-waveform-bg border rounded relative overflow-hidden">
          {values.map((value, index) => {
            const width = 100 / Math.max(values.length, 10);
            let color = "bg-muted";
            let height = "h-2";
            
            if (type === "digital") {
              color = value ? "bg-primary" : "bg-muted";
              height = value ? "h-6" : "h-2";
            } else if (type === "data") {
              color = value && value !== "" ? "bg-accent" : "bg-muted";
              height = value && value !== "" ? "h-6" : "h-2";
            } else if (type === "state") {
              const stateVal = value as number;
              color = stateVal === 0 ? "bg-state-idle" : stateVal === 1 ? "bg-state-syn" : "bg-state-ack";
              height = `h-${Math.max(2, stateVal * 2 + 2)}`;
            }
            
            return (
              <div
                key={index}
                className={`absolute ${color} ${height} transition-all duration-200`}
                style={{
                  left: `${index * width}%`,
                  width: `${width}%`,
                  bottom: type === "state" ? "0" : value ? "2px" : "14px"
                }}
                title={`${label}: ${value}`}
              />
            );
          })}
          
          {/* Grid lines */}
          {Array.from({ length: Math.min(values.length + 1, 11) }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-full bg-border opacity-30"
              style={{ left: `${(i * 100) / Math.max(values.length, 10)}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Prepare waveform data from recent packets
  const recentPackets = packets.slice(-10).concat(Array(Math.max(0, 10 - packets.length)).fill(null));
  
  const clkSignal = recentPackets.map((_, i) => i % 2 === 0);
  const validInSignal = recentPackets.map(p => p?.valid_in || false);
  const validOutSignal = recentPackets.map(p => p?.valid_out || false);
  const dataInSignal = recentPackets.map(p => p?.data_in || "");
  const dataOutSignal = recentPackets.map(p => p?.data_out || "");
  const stateSignal = recentPackets.map(p => p ? getStateNumber(p.state) : 0);
  const errorSignal = recentPackets.map(p => p?.error || false);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Waveform Display
          <Badge variant="secondary" className="ml-auto">
            Last {Math.min(packets.length, 10)} cycles
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Time reference */}
          <div className="flex items-center mb-4">
            <div className="w-24 text-xs font-mono text-right pr-2 text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Time
            </div>
            <div className="flex-1 h-6 relative">
              {recentPackets.map((packet, index) => (
                <div
                  key={index}
                  className="absolute text-xs text-muted-foreground"
                  style={{ 
                    left: `${(index * 100) / Math.max(recentPackets.length, 10)}%`,
                    transform: "translateX(-50%)"
                  }}
                >
                  {packet ? `T${packet.id}` : "--"}
                </div>
              ))}
            </div>
          </div>

          {/* Clock signal */}
          <SignalRow label="clk" values={clkSignal} type="digital" />
          
          {/* Input signals */}
          <div className="my-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Inputs</div>
            <SignalRow label="valid_in" values={validInSignal} type="digital" />
            <SignalRow label="data_in" values={dataInSignal} type="data" />
          </div>

          {/* Output signals */}
          <div className="my-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Outputs</div>
            <SignalRow label="valid_out" values={validOutSignal} type="digital" />
            <SignalRow label="data_out" values={dataOutSignal} type="data" />
          </div>

          {/* Internal signals */}
          <div className="my-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Internal</div>
            <SignalRow label="state" values={stateSignal} type="state" />
            <SignalRow label="error" values={errorSignal} type="digital" />
          </div>

          {/* Signal Legend */}
          <div className="mt-4 p-3 bg-packet-bg rounded-lg">
            <div className="text-xs font-medium mb-2">Signal Legend</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-primary rounded" />
                <span>Digital High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-muted rounded" />
                <span>Digital Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-accent rounded" />
                <span>Data Valid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-state-idle rounded" />
                <span>IDLE State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-state-syn rounded" />
                <span>SYN_RX State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-state-ack rounded" />
                <span>ACK_RX State</span>
              </div>
            </div>
          </div>

          {/* Protocol Analysis */}
          {packets.length > 0 && (
            <div className="mt-4 p-3 bg-waveform-bg rounded-lg">
              <div className="text-xs font-medium mb-2">Protocol Analysis</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Last Data Exchange:</span>
                  <span className="font-mono">
                    {packets[packets.length - 1]?.data_in} → {packets[packets.length - 1]?.data_out}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current State:</span>
                  <span className="font-mono">
                    {packets[packets.length - 1]?.state || "IDLE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Handshake Status:</span>
                  <span className={`font-mono ${
                    packets[packets.length - 1]?.state === "ACK_RECEIVED" 
                      ? "text-success" 
                      : "text-warning"
                  }`}>
                    {packets[packets.length - 1]?.state === "ACK_RECEIVED" 
                      ? "Complete" 
                      : "In Progress"
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}