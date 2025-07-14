import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, TrendingUp } from "lucide-react";

interface TestStats {
  total: number;
  pass: number;
  fail: number;
  inputCoverage: number;
  fsmCoverage: number;
}

interface CoverageDisplayProps {
  stats: TestStats;
}

export default function CoverageDisplay({ stats }: CoverageDisplayProps) {
  const passRate = stats.total > 0 ? (stats.pass / stats.total) * 100 : 0;
  
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "text-success";
    if (coverage >= 60) return "text-warning";
    return "text-destructive";
  };

  const getCoverageBadge = (coverage: number) => {
    if (coverage >= 90) return "Excellent";
    if (coverage >= 80) return "Good";
    if (coverage >= 60) return "Fair";
    return "Poor";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Coverage & Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Test Results */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pass Rate</span>
              <span className={`text-lg font-bold ${getCoverageColor(passRate)}`}>
                {passRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={passRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Pass: {stats.pass}</span>
              <span>Fail: {stats.fail}</span>
              <span>Total: {stats.total}</span>
            </div>
          </div>

          {/* Input Coverage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Input Coverage</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getCoverageColor(stats.inputCoverage)}`}>
                  {stats.inputCoverage.toFixed(1)}%
                </span>
                <Badge 
                  variant={stats.inputCoverage >= 80 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getCoverageBadge(stats.inputCoverage)}
                </Badge>
              </div>
            </div>
            <Progress value={stats.inputCoverage} className="h-3" />
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">Covers input combinations:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span>SYN ("S"):</span>
                  <span className="font-mono text-state-syn">Covered</span>
                </div>
                <div className="flex justify-between">
                  <span>ACK ("K"):</span>
                  <span className="font-mono text-state-ack">Covered</span>
                </div>
                <div className="flex justify-between">
                  <span>Noise ("Z"):</span>
                  <span className="font-mono text-warning">Partial</span>
                </div>
                <div className="flex justify-between">
                  <span>Misc (X,Y):</span>
                  <span className="font-mono text-info">Partial</span>
                </div>
              </div>
            </div>
          </div>

          {/* FSM Coverage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">FSM Coverage</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getCoverageColor(stats.fsmCoverage)}`}>
                  {stats.fsmCoverage.toFixed(1)}%
                </span>
                <Badge 
                  variant={stats.fsmCoverage >= 80 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getCoverageBadge(stats.fsmCoverage)}
                </Badge>
              </div>
            </div>
            <Progress value={stats.fsmCoverage} className="h-3" />
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">State transitions covered:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>IDLE → SYN_RECEIVED:</span>
                  <span className="font-mono text-state-syn">
                    {stats.fsmCoverage > 30 ? "Covered" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SYN_RECEIVED → ACK_RECEIVED:</span>
                  <span className="font-mono text-state-ack">
                    {stats.fsmCoverage > 60 ? "Covered" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reset transitions:</span>
                  <span className="font-mono text-state-idle">
                    {stats.fsmCoverage > 80 ? "Covered" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Goals */}
          <div className="p-3 bg-waveform-bg rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Coverage Goals</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.inputCoverage >= 90 ? "bg-success" : "bg-muted"
                }`} />
                <span>Input: 90%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.fsmCoverage >= 90 ? "bg-success" : "bg-muted"
                }`} />
                <span>FSM: 90%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  passRate >= 95 ? "bg-success" : "bg-muted"
                }`} />
                <span>Pass Rate: 95%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.total >= 50 ? "bg-success" : "bg-muted"
                }`} />
                <span>Tests: 50+</span>
              </div>
            </div>
          </div>

          {/* Assertions Status */}
          <div className="p-3 bg-packet-bg rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Assertion Status</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>p_syn_ack:</span>
                <Badge variant="outline" className="text-xs text-success">
                  PASS
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>p_k_response:</span>
                <Badge variant="outline" className="text-xs text-success">
                  PASS
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>p_bad_checksum:</span>
                <Badge variant="outline" className="text-xs text-success">
                  PASS
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}