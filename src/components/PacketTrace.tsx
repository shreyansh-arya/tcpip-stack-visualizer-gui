import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";

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

interface PacketTraceProps {
  packets: Packet[];
}

export default function PacketTrace({ packets }: PacketTraceProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${timeStr}.${ms}`;
  };

  const getStatusIcon = (packet: Packet) => {
    if (packet.error) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return packet.match ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "IDLE":
        return "bg-state-idle/10 text-state-idle border-state-idle/20";
      case "SYN_RECEIVED":
        return "bg-state-syn/10 text-state-syn border-state-syn/20";
      case "ACK_RECEIVED":
        return "bg-state-ack/10 text-state-ack border-state-ack/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Packet Trace Table
          <Badge variant="secondary" className="ml-auto">
            {packets.length} packets
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 p-2 bg-muted rounded text-xs font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-1">In</div>
              <div className="col-span-1">Checksum</div>
              <div className="col-span-1">Valid</div>
              <div className="col-span-1">Out</div>
              <div className="col-span-1">Expected</div>
              <div className="col-span-2">State</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Match</div>
            </div>

            {/* Packet Rows */}
            {packets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No packets sent yet. Start testing to see packet traces.
              </div>
            ) : (
              packets.map((packet) => (
                <div
                  key={packet.id}
                  className={`grid grid-cols-12 gap-2 p-2 rounded text-xs border transition-all hover:bg-muted/50 ${
                    packet.error ? "bg-warning/5 border-warning/20" : 
                    packet.match ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                  }`}
                >
                  <div className="col-span-1 font-mono">{packet.id}</div>
                  <div className="col-span-2 font-mono text-muted-foreground">
                    {formatTime(packet.timestamp)}
                  </div>
                  <div className="col-span-1 font-mono font-bold">{packet.data_in}</div>
                  <div className="col-span-1 font-mono">{packet.checksum_in}</div>
                  <div className="col-span-1">
                    {packet.valid_in ? (
                      <CheckCircle className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="col-span-1 font-mono font-bold text-primary">{packet.data_out}</div>
                  <div className="col-span-1 font-mono text-muted-foreground">{packet.expected}</div>
                  <div className="col-span-2">
                    <Badge 
                      className={`text-xs ${getStateColor(packet.state)}`}
                      variant="outline"
                    >
                      {packet.state}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {getStatusIcon(packet)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {packet.match ? (
                      <CheckCircle className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary Statistics */}
        {packets.length > 0 && (
          <div className="mt-4 p-3 bg-waveform-bg rounded-lg">
            <div className="text-sm font-medium mb-2">Trace Summary</div>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Total Packets:</span>
                <div className="font-bold">{packets.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Passed:</span>
                <div className="font-bold text-success">
                  {packets.filter(p => p.match && !p.error).length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Failed:</span>
                <div className="font-bold text-destructive">
                  {packets.filter(p => !p.match || p.error).length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Errors:</span>
                <div className="font-bold text-warning">
                  {packets.filter(p => p.error).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}