import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Network,
  Target,
  BarChart3
} from "lucide-react";
import StateVisualizer from "./StateVisualizer";
import PacketTrace from "./PacketTrace";
import CoverageDisplay from "./CoverageDisplay";
import WaveformDisplay from "./WaveformDisplay";

type FSMState = "IDLE" | "SYN_RECEIVED" | "ACK_RECEIVED";

interface Packet {
  id: number;
  timestamp: number;
  data_in: string;
  checksum_in: string;
  valid_in: boolean;
  data_out: string;
  valid_out: boolean;
  state: FSMState;
  error: boolean;
  expected: string;
  match: boolean;
}

interface TestStats {
  total: number;
  pass: number;
  fail: number;
  inputCoverage: number;
  fsmCoverage: number;
}

export default function TCPIPStackTester() {
  const [currentState, setCurrentState] = useState<FSMState>("IDLE");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  
  // Input controls
  const [dataIn, setDataIn] = useState("S");
  const [checksumIn, setChecksumIn] = useState("AA");
  const [validIn, setValidIn] = useState(true);
  
  // Outputs
  const [dataOut, setDataOut] = useState("");
  const [validOut, setValidOut] = useState(false);
  
  // Test data
  const [packets, setPackets] = useState<Packet[]>([]);
  const [packetCounter, setPacketCounter] = useState(0);
  const [testStats, setTestStats] = useState<TestStats>({
    total: 0,
    pass: 0,
    fail: 0,
    inputCoverage: 0,
    fsmCoverage: 0
  });

  // Simulation logic
  const calculateChecksum = (data: string): string => {
    const ascii = data.charCodeAt(0);
    const checksum = ascii ^ 0xFF;
    return checksum.toString(16).toUpperCase().padStart(2, '0');
  };

  const isValidChecksum = (data: string, checksum: string): boolean => {
    const expected = calculateChecksum(data);
    return checksum.toUpperCase() === expected;
  };

  const getExpectedOutput = (data: string, state: FSMState, isValidChecksum: boolean): string => {
    if (!isValidChecksum) return "E";
    
    switch (state) {
      case "IDLE":
        return data === "S" ? "A" : data;
      case "SYN_RECEIVED":
        return data === "K" ? "C" : data;
      case "ACK_RECEIVED":
        return data;
      default:
        return data;
    }
  };

  const getNextState = (data: string, currentState: FSMState, isValidChecksum: boolean): FSMState => {
    if (!isValidChecksum) return currentState;
    
    switch (currentState) {
      case "IDLE":
        return data === "S" ? "SYN_RECEIVED" : "IDLE";
      case "SYN_RECEIVED":
        return data === "K" ? "ACK_RECEIVED" : "SYN_RECEIVED";
      case "ACK_RECEIVED":
        return "ACK_RECEIVED";
      default:
        return "IDLE";
    }
  };

  const sendPacket = () => {
    if (!validIn) return;

    const checksumValid = isValidChecksum(dataIn, checksumIn);
    const expectedOutput = getExpectedOutput(dataIn, currentState, checksumValid);
    const nextState = getNextState(dataIn, currentState, checksumValid);
    
    // Simulate DUT behavior
    const actualOutput = expectedOutput;
    const actualValidOut = true;
    
    const newPacket: Packet = {
      id: packetCounter + 1,
      timestamp: Date.now(),
      data_in: dataIn,
      checksum_in: checksumIn,
      valid_in: validIn,
      data_out: actualOutput,
      valid_out: actualValidOut,
      state: currentState,
      error: !checksumValid,
      expected: expectedOutput,
      match: actualOutput === expectedOutput
    };

    setPackets(prev => [...prev, newPacket]);
    setPacketCounter(prev => prev + 1);
    setDataOut(actualOutput);
    setValidOut(actualValidOut);
    setCurrentState(nextState);

    // Update statistics
    setTestStats(prev => ({
      total: prev.total + 1,
      pass: prev.pass + (newPacket.match ? 1 : 0),
      fail: prev.fail + (newPacket.match ? 0 : 1),
      inputCoverage: Math.min(100, prev.inputCoverage + Math.random() * 5),
      fsmCoverage: Math.min(100, prev.fsmCoverage + Math.random() * 3)
    }));
  };

  const resetDUT = () => {
    setCurrentState("IDLE");
    setDataOut("");
    setValidOut(false);
    setPackets([]);
    setPacketCounter(0);
    setTestStats({ total: 0, pass: 0, fail: 0, inputCoverage: 0, fsmCoverage: 0 });
  };

  const runRandomTest = () => {
    const testInputs = ["S", "K", "Z", "X", "Y"];
    const randomData = testInputs[Math.floor(Math.random() * testInputs.length)];
    const useValidChecksum = Math.random() > 0.2; // 80% valid checksums
    
    setDataIn(randomData);
    setChecksumIn(useValidChecksum ? calculateChecksum(randomData) : "BB");
    setValidIn(true);
    
    setTimeout(() => sendPacket(), 100);
  };

  // Auto-run functionality
  useEffect(() => {
    if (autoRun && isRunning && !isPaused) {
      const interval = setInterval(() => {
        runRandomTest();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRun, isRunning, isPaused]);

  const toggleAutoRun = () => {
    setAutoRun(!autoRun);
    if (!autoRun) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Testing Environment for TCP/IP Stack in SystemVerilog
          </h1>
          <p className="text-muted-foreground text-lg">
            Interactive verification platform for TCP/IP protocol implementation
          </p>
        </div>

        {/* Control Panel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Input Controls */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Input Controls</Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="data-in" className="text-xs">Data In</Label>
                    <Input
                      id="data-in"
                      value={dataIn}
                      onChange={(e) => setDataIn(e.target.value.charAt(0).toUpperCase())}
                      maxLength={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="checksum-in" className="text-xs">Checksum In (Hex)</Label>
                    <Input
                      id="checksum-in"
                      value={checksumIn}
                      onChange={(e) => setChecksumIn(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="valid-in"
                      checked={validIn}
                      onCheckedChange={setValidIn}
                    />
                    <Label htmlFor="valid-in" className="text-xs">Valid In</Label>
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Outputs</Label>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded">
                    <Label className="text-xs">Data Out</Label>
                    <div className="text-lg font-mono font-bold text-primary">
                      {dataOut || "—"}
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <Label className="text-xs">Valid Out</Label>
                    <div className="flex items-center gap-1">
                      {validOut ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{validOut ? "TRUE" : "FALSE"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Controls */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Test Controls</Label>
                <div className="space-y-2">
                  <Button onClick={sendPacket} className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Send Packet
                  </Button>
                  <Button onClick={runRandomTest} variant="outline" className="w-full" size="sm">
                    <Target className="h-4 w-4 mr-1" />
                    Random Test
                  </Button>
                  <Button 
                    onClick={toggleAutoRun} 
                    variant={autoRun ? "destructive" : "secondary"} 
                    className="w-full" 
                    size="sm"
                  >
                    {autoRun ? <Pause className="h-4 w-4 mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
                    {autoRun ? "Stop Auto" : "Start Auto"}
                  </Button>
                  <Button onClick={resetDUT} variant="outline" className="w-full" size="sm">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset DUT
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Quick Stats</Label>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded">
                    <Label className="text-xs">Total Tests</Label>
                    <div className="text-lg font-bold">{testStats.total}</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <Label className="text-xs">Pass Rate</Label>
                    <div className="text-lg font-bold text-success">
                      {testStats.total > 0 ? Math.round((testStats.pass / testStats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State Visualizer */}
          <StateVisualizer currentState={currentState} />
          
          {/* Coverage Display */}
          <CoverageDisplay stats={testStats} />
        </div>

        {/* Waveform Display */}
        <WaveformDisplay packets={packets.slice(-20)} />

        {/* Packet Trace */}
        <PacketTrace packets={packets} />
      </div>
    </div>
  );
}