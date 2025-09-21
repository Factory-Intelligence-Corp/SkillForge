import { AIControlDisclaimer } from "@/components/common/ai-control-disclaimer";
import { HuggingFaceKeyInput } from "@/components/common/huggingface-key";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetcher } from "@/lib/utils";
import { AdminTokenSettings, ServerStatus } from "@/types";
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  Camera,
  Code,
  Dumbbell,
  FileCog,
  FolderOpen,
  LoaderCircle,
  Network,
  Play,
  Settings,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

function RobotStatusAlert({
  serverStatus,
  isLoading,
  robotConnected,
}: {
  serverStatus?: ServerStatus;
  isLoading: boolean;
  robotConnected: boolean;
}) {
  if (isLoading) {
    return (
      <Alert>
        <AlertTitle className="flex flex-row gap-1 items-center">
          <LoaderCircle className="animate-spin size-5 mr-1" />
          Status: Loading
        </AlertTitle>
        <AlertDescription>Loading robot status...</AlertDescription>
      </Alert>
    );
  }

  if (!serverStatus) {
    return (
      <Alert>
        <AlertTitle className="flex flex-row gap-1 items-center">
          <span className="size-2 rounded-full bg-red-500" />
          <Bot className="size-5 mr-1" />
          Status: Communication Error
        </AlertTitle>
        <AlertDescription>
          Error fetching robot status. Please check the server connection.
        </AlertDescription>
      </Alert>
    );
  }

  if (robotConnected) {
    return (
      <Alert>
        <AlertTitle className="flex flex-row gap-1 items-center">
          <span className="size-2 rounded-full bg-primary" />
          <Bot className="size-5 mr-1" />
          Status: Connected
        </AlertTitle>
        <AlertDescription>
          Robot is connected and ready to control.
        </AlertDescription>
      </Alert>
    );
  } else {
    return (
      <Alert>
        <AlertTitle className="flex flex-row gap-1 items-center">
          <span className="size-2 rounded-full bg-red-500" />
          <Bot className="size-5 mr-1" />
          Status: Disconnected
        </AlertTitle>
        <AlertDescription>
          Check the robot is plugged to your computer and powered on. Unplug and
          plug cables again if needed.
        </AlertDescription>
      </Alert>
    );
  }
}


export function DashboardPage() {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  
  const { data: serverStatus, isLoading } = useSWR<ServerStatus>(
    ["/status"],
    ([url]) => fetcher(url),
    {
      refreshInterval: 5000,
    },
  );
  
  const { data: adminSettingsTokens } = useSWR<AdminTokenSettings>(
    ["/admin/settings/tokens"],
    ([url]) => fetcher(url, "POST"),
  );

  const robotConnected =
    serverStatus !== undefined &&
    serverStatus.robots &&
    serverStatus.robots.length > 0;

  const handleControlByAI = () => {
    if (localStorage.getItem("disclaimer_accepted") === "true") {
      navigate(`/inference`);
      return;
    }
    setShowWarning(true);
  };

  const onProceed = () => {
    setShowWarning(false);
    localStorage.setItem("disclaimer_accepted", true.toString());
    navigate(`/inference`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      {/* Robot Control Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Play className="size-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Control and Record</h2>
                </div>
                <p className="text-muted-foreground">
                  Control the robot with your keyboard, a leader arm, or a VR headset. Record and replay movements. Record datasets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <RobotStatusAlert
                serverStatus={serverStatus}
                isLoading={isLoading}
                robotConnected={robotConnected}
              />
              
              <div className="flex items-center">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-16"
                  disabled={!robotConnected}
                  onClick={() => {
                    if (!robotConnected) return;
                    navigate("/control");
                  }}
                >
                  <Play className="size-5 mr-2" />
                  Start Control Session
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button asChild variant="outline" size="lg">
                <a href="/browse" className="h-12">
                  <FolderOpen className="size-5 mr-2" />
                  Browse Datasets
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/calibration" className="h-12">
                  <Sliders className="size-5 mr-2" />
                  Calibration
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Training and Control */}
      <Card>
        <CardContent className="p-6 h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BrainCircuit className="size-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">AI Training and Control</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Teach your robot new skills. Control your robot with Artificial Intelligence.
            </p>

            <div className="flex-1 flex flex-col justify-between">
              {!isLoading && !adminSettingsTokens?.huggingface && (
                <div className="mb-4">
                  <HuggingFaceKeyInput />
                </div>
              )}

              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-12"
                      onClick={() => navigate("/train")}
                      disabled={!adminSettingsTokens?.huggingface}
                    >
                      <Dumbbell className="size-5 mr-2" />
                      Train an AI Model
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      Once you have recorded a dataset, you can train an AI model. Make sure you have a HuggingFace account and a valid API key.
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full h-12"
                      onClick={handleControlByAI}
                      disabled={!adminSettingsTokens?.huggingface}
                    >
                      <BrainCircuit className="size-5 mr-2" />
                      Go to AI Control
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      After training your AI model, let your AI model control the robot.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardContent className="p-6 h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="size-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Advanced Settings</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Configure the server and the robot settings.
            </p>

            <div className="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="secondary" size="lg">
                  <a href="/admin" className="h-12">
                    <FileCog className="size-5 mr-2" />
                    Admin Configuration
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="/docs" className="h-12">
                    <Code className="size-5 mr-2" />
                    API Documentation
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="/viz" className="h-12">
                    <Camera className="size-5 mr-2" />
                    Camera Overview
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="/network" className="h-12">
                    <Network className="size-5 mr-2" />
                    Network Management
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Control Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md border-amber-300 border">
          <DialogHeader className="bg-amber-50 dark:bg-amber-950/20 p-4 -m-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-16 text-red-500 mr-2" />
              <DialogTitle className="text-bold font-bold tracking-tight">
                You are about to surrender control to an artificial intelligence system.
              </DialogTitle>
            </div>
          </DialogHeader>

          <AIControlDisclaimer />

          <DialogFooter className="gap-x-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowWarning(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button variant="default" onClick={onProceed}>
              I Understand the Risks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
