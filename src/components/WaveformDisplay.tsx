import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Zap, Cpu, Database } from "lucide-react";

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
  const recentPackets = packets.slice(-12).concat(Array(Math.max(0, 12 - packets.length)).fill(null));
  
  const SignalTrack = ({ 
    label, 
    values, 
    type = "digital",
    icon: Icon 
  }: { 
    label: string; 
    values: (boolean | string | number)[]; 
    type?: "digital" | "data" | "state" | "clock";
    icon?: any;
  }) => {
    return (
      <div className="group relative">
        <div className="flex items-center mb-2">
          <div className="flex items-center gap-2 w-28 text-xs font-mono font-medium text-muted-foreground">
            {Icon && <Icon className="h-3 w-3" />}
            {label}
          </div>
          <div className="flex-1 h-12 bg-gradient-waveform border border-waveform-border rounded-lg relative overflow-hidden shadow-inner">
            {/* Grid Background */}
            <div className="absolute inset-0">
              {Array.from({ length: 13 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-px h-full bg-waveform-grid opacity-40"
                  style={{ left: `${(i * 100) / 12}%` }}
                />
              ))}
              <div className="absolute w-full h-px bg-waveform-grid opacity-40 top-1/2" />
            </div>
            
            {/* Signal Waves */}
            {values.map((value, index) => {
              const width = 100 / 12;
              let signalProps = getSignalProps(value, type);
              
              return (
                <div key={index} className="absolute inset-y-0 group/signal">
                  <div
                    className={`absolute transition-all duration-300 ease-in-out ${signalProps.color} ${signalProps.height} rounded-sm`}
                    style={{
                      left: `${index * width + 1}%`,
                      width: `${width - 2}%`,
                      bottom: signalProps.bottom,
                      filter: value ? "drop-shadow(0 0 4px currentColor)" : "none"
                    }}
                    title={`${label}: ${value} @ T${index}`}
                  />
                  
                  {/* Value Labels for Data Signals */}
                  {type === "data" && value && value !== "" && (
                    <div
                      className="absolute text-xs font-mono font-bold text-center pointer-events-none opacity-80"
                      style={{
                        left: `${index * width + width/2}%`,
                        transform: "translateX(-50%)",
                        top: "2px",
                        color: "hsl(var(--accent-foreground))"
                      }}
                    >
                      {value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const getSignalProps = (value: boolean | string | number, type: string) => {
    switch (type) {
      case "clock":
        return {
          color: value ? "bg-primary shadow-glow" : "bg-signal-low",
          height: value ? "h-8" : "h-2",
          bottom: value ? "4px" : "20px"
        };
      case "digital":
        return {
          color: value ? "bg-signal-high shadow-glow" : "bg-signal-low",
          height: value ? "h-8" : "h-2",
          bottom: value ? "4px" : "20px"
        };
      case "data":
        return {
          color: value && value !== "" ? "bg-signal-data shadow-accent" : "bg-signal-low",
          height: value && value !== "" ? "h-8" : "h-2",
          bottom: value && value !== "" ? "4px" : "20px"
        };
      case "state":
        const stateVal = value as number;
        const stateColors = ["bg-state-idle", "bg-state-syn", "bg-state-ack"];
        return {
          color: stateColors[stateVal] || "bg-signal-low",
          height: `h-${Math.max(2, stateVal * 3 + 2)}`,
          bottom: "4px"
        };
      default:
        return {
          color: "bg-signal-low",
          height: "h-2",
          bottom: "20px"
        };
    }
  };

  // Prepare signal data
  const clockSignal = recentPackets.map((_, i) => i % 2 === 0);
  const validInSignal = recentPackets.map(p => p?.valid_in || false);
  const validOutSignal = recentPackets.map(p => p?.valid_out || false);
  const dataInSignal = recentPackets.map(p => p?.data_in || "");
  const dataOutSignal = recentPackets.map(p => p?.data_out || "");
  const stateSignal = recentPackets.map(p => p ? getStateNumber(p.state) : 0);
  const errorSignal = recentPackets.map(p => p?.error || false);

  function getStateNumber(state: string) {
    switch (state) {
      case "IDLE": return 0;
      case "SYN_RECEIVED": return 1;
      case "ACK_RECEIVED": return 2;
      default: return 0;
    }
  }
  return (
    <Card className="shadow-elevated bg-gradient-waveform border-waveform-border">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <Activity className="h-6 w-6" />
          Digital Waveform Analyzer
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
            {Math.min(packets.length, 12)} cycles
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Time Reference */}
        <div className="flex items-center">
          <div className="flex items-center gap-2 w-28 text-xs font-mono font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            Time
          </div>
          <div className="flex-1 h-8 relative bg-test-bg border border-test-border rounded-lg">
            {recentPackets.map((packet, index) => (
              <div
                key={index}
                className="absolute text-xs font-mono text-center font-medium"
                style={{ 
                  left: `${(index * 100) / 12 + 100/24}%`,
                  transform: "translateX(-50%)",
                  top: "6px",
                  color: packet ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                }}
              >
                {packet ? `T${packet.id}` : "--"}
              </div>
            ))}
          </div>
        </div>

        {/* System Clock */}
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            System Clock
          </h3>
          <SignalTrack label="clk" values={clockSignal} type="clock" icon={Zap} />
        </div>
        
        {/* Input Signals */}
        <div className="border border-accent/20 rounded-lg p-4 bg-accent/5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-accent">
            <Database className="h-4 w-4" />
            Input Signals
          </h3>
          <div className="space-y-3">
            <SignalTrack label="valid_in" values={validInSignal} type="digital" />
            <SignalTrack label="data_in" values={dataInSignal} type="data" />
          </div>
        </div>

        {/* Output Signals */}
        <div className="border border-success/20 rounded-lg p-4 bg-success/5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-success">
            <Database className="h-4 w-4" />
            Output Signals
          </h3>
          <div className="space-y-3">
            <SignalTrack label="valid_out" values={validOutSignal} type="digital" />
            <SignalTrack label="data_out" values={dataOutSignal} type="data" />
          </div>
        </div>

        {/* Internal State */}
        <div className="border border-warning/20 rounded-lg p-4 bg-warning/5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-warning">
            <Cpu className="h-4 w-4" />
            Internal State
          </h3>
          <div className="space-y-3">
            <SignalTrack label="state" values={stateSignal} type="state" />
            <SignalTrack label="error" values={errorSignal} type="digital" />
          </div>
        </div>

        {/* Protocol Analysis */}
        {packets.length > 0 && (
          <div className="bg-gradient-secondary p-4 rounded-lg border">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Real-time Protocol Analysis
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Exchange:</span>
                  <span className="font-mono font-medium">
                    {packets[packets.length - 1]?.data_in || "--"} → {packets[packets.length - 1]?.data_out || "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current State:</span>
                  <Badge variant="outline" className="font-mono">
                    {packets[packets.length - 1]?.state || "IDLE"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Handshake:</span>
                  <Badge 
                    variant={packets[packets.length - 1]?.state === "ACK_RECEIVED" ? "default" : "secondary"}
                    className={packets[packets.length - 1]?.state === "ACK_RECEIVED" ? "bg-success text-success-foreground" : ""}
                  >
                    {packets[packets.length - 1]?.state === "ACK_RECEIVED" ? "Complete" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Status:</span>
                  <Badge 
                    variant={packets[packets.length - 1]?.error ? "destructive" : "secondary"}
                    className={packets[packets.length - 1]?.error ? "" : "bg-success text-success-foreground"}
                  >
                    {packets[packets.length - 1]?.error ? "Error" : "OK"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}