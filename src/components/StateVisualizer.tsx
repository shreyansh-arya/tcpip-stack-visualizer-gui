import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, ArrowRight } from "lucide-react";

type FSMState = "IDLE" | "SYN_RECEIVED" | "ACK_RECEIVED";

interface StateVisualizerProps {
  currentState: FSMState;
}

export default function StateVisualizer({ currentState }: StateVisualizerProps) {
  const getStateColor = (state: FSMState) => {
    switch (state) {
      case "IDLE":
        return "bg-state-idle text-white";
      case "SYN_RECEIVED":
        return "bg-state-syn text-white";
      case "ACK_RECEIVED":
        return "bg-state-ack text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isStateActive = (state: FSMState) => state === currentState;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          FSM State Diagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* State Transition Diagram */}
          <div className="flex flex-col items-center space-y-4">
            {/* IDLE State */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isStateActive("IDLE")
                    ? "bg-state-idle text-white ring-4 ring-state-idle/30 scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                IDLE
              </div>
              <Badge className="mt-2" variant={isStateActive("IDLE") ? "default" : "secondary"}>
                State 0
              </Badge>
            </div>

            {/* Arrow and transition condition */}
            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">data_in = "S"</span>
            </div>

            {/* SYN_RECEIVED State */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isStateActive("SYN_RECEIVED")
                    ? "bg-state-syn text-white ring-4 ring-state-syn/30 scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                SYN_RX
              </div>
              <Badge className="mt-2" variant={isStateActive("SYN_RECEIVED") ? "default" : "secondary"}>
                State 1
              </Badge>
            </div>

            {/* Arrow and transition condition */}
            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">data_in = "K"</span>
            </div>

            {/* ACK_RECEIVED State */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isStateActive("ACK_RECEIVED")
                    ? "bg-state-ack text-white ring-4 ring-state-ack/30 scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                ACK_RX
              </div>
              <Badge className="mt-2" variant={isStateActive("ACK_RECEIVED") ? "default" : "secondary"}>
                State 2
              </Badge>
            </div>
          </div>

          {/* Current State Info */}
          <div className="mt-6 p-4 bg-waveform-bg rounded-lg">
            <div className="text-sm font-medium mb-2">Current State Information</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">State:</span>
                <span className="ml-2 font-mono font-bold">{currentState}</span>
              </div>
              <div>
                <span className="text-muted-foreground">State Code:</span>
                <span className="ml-2 font-mono font-bold">
                  {currentState === "IDLE" ? "00" : currentState === "SYN_RECEIVED" ? "01" : "10"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Expected Input:</span>
                <span className="ml-2 font-mono font-bold">
                  {currentState === "IDLE" ? "S" : currentState === "SYN_RECEIVED" ? "K" : "Any"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Expected Output:</span>
                <span className="ml-2 font-mono font-bold">
                  {currentState === "IDLE" ? "A" : currentState === "SYN_RECEIVED" ? "C" : "Echo"}
                </span>
              </div>
            </div>
          </div>

          {/* State Transitions Legend */}
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">State Transitions</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>IDLE → SYN_RECEIVED:</span>
                <span className="font-mono">S → A</span>
              </div>
              <div className="flex justify-between">
                <span>SYN_RECEIVED → ACK_RECEIVED:</span>
                <span className="font-mono">K → C</span>
              </div>
              <div className="flex justify-between">
                <span>Checksum Error:</span>
                <span className="font-mono text-destructive">Any → E</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}