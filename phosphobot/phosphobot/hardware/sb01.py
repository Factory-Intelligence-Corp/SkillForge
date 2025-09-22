"""
SB01 Robot Hardware - StandardBots SDK Implementation

Requires: pip install standardbots
"""

from typing import Any, List, Literal, Optional, Tuple
import numpy as np
from loguru import logger
from standardbots import StandardBotsRobot
from standardbots import models
from phosphobot.hardware.base import BaseManipulator
from phosphobot.models.robot import RobotConfigStatus
from phosphobot.utils import get_resources_path


class SB01Hardware(BaseManipulator):
    name = "sb-01"
    
    # Required class attributes - MUST be defined for BaseManipulator to work
    URDF_FILE_PATH = str(get_resources_path() / "urdf" / "SB01" / "urdf" / "sbot.urdf.xacro")
    AXIS_ORIENTATION = [0, 0, 1, 1]
    END_EFFECTOR_LINK_INDEX = 7
    GRIPPER_JOINT_INDEX = 8
    SERVO_IDS = [1, 2, 3, 4, 5, 6]  # StandardBots joint indices (J0-J5)
    RESOLUTION = 1000  # Arbitrary resolution for unit conversion
    CALIBRATION_POSITION = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]  # 6-axis robot
    
    def __init__(self, url: str, token: str, **kwargs):
        """Initialize StandardBots robot connection."""
        super().__init__(**kwargs)
        
        # StandardBots SDK connection - both required for connection
        self.url = url
        self.token = token
        
        self.sdk = StandardBotsRobot(
            url=self.url,
            token=self.token,
            robot_kind=StandardBotsRobot.RobotKind.Live,
        )

    async def connect(self) -> None:
        """Connect to StandardBots robot."""
        try:
            # Test connection by trying to use the SDK
            with self.sdk.connection():
                # TODO: Add actual connection verification if StandardBots SDK has a test method
                # For now, if no exception is thrown, assume connection is successful
                pass
            
            self.is_connected = True
            logger.info(f"Connected to StandardBots robot at {self.url}")
            
        except Exception as e:
            logger.error(f"Failed to connect to StandardBots robot: {e}")
            self.is_connected = False
            raise

    def disconnect(self) -> None:
        """Disconnect from StandardBots robot."""
        if self.is_connected:
            # StandardBots SDK handles connection cleanup automatically
            self.is_connected = False
            logger.info("Disconnected from StandardBots robot")
    
    # ⚠️  100% REQUIRED - ABSTRACT methods (will crash if not implemented)
    
    def enable_torque(self) -> None:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def disable_torque(self) -> None:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def read_motor_torque(self, servo_id: int) -> Optional[float]:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def read_motor_voltage(self, servo_id: int) -> Optional[float]:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def write_motor_position(self, servo_id: int, units: int, **kwargs: Any) -> None:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def read_motor_position(self, servo_id: int, **kwargs: Any) -> Optional[int]:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    def calibrate_motors(self, **kwargs: Any) -> None:
        raise NotImplementedError  # 🔴 MUST IMPLEMENT

    # 🟡 NOT 100% REQUIRED - May have fallback behavior or optional features
    
    def read_motor_temperature(self, servo_id: int) -> Optional[Tuple[float, float]]:
        raise NotImplementedError  # 🟡 OPTIONAL - can return None if no temp sensors

    def write_group_motor_maximum_temperature(self, maximum_temperature_target: List[int]) -> None:
        raise NotImplementedError  # 🟡 OPTIONAL - safety feature, can be empty
    
    def read_group_motor_position(self) -> np.ndarray:
        raise NotImplementedError  # 🟡 OPTIONAL - falls back to individual reads

    def write_group_motor_position(self, q_target: np.ndarray, enable_gripper: bool) -> None:
        """Write all motor positions using StandardBots SDK."""
        with self.sdk.connection():
            # Convert motor units to joint positions (J0, J1, J2, J3, J4, J5)
            # TODO: Implement proper unit conversion if needed
            target_position = tuple(q_target.tolist()[:6])  # Ensure 6 joints
            
            body = models.ArmPositionUpdateRequest(
                kind=models.ArmPositionUpdateRequestKindEnum.JointRotation,
                joint_rotation=models.ArmJointRotations(joints=target_position),
            )

            response = self.sdk.movement.position.set_arm_position(body=body)
            try:
                data = response.ok()
            except Exception as e:
                print(f"StandardBots error: {response.data.message}")
                raise e

    async def calibrate(self) -> Tuple[Literal["success", "in_progress", "error"], str]:
        raise NotImplementedError  # 🟡 OPTIONAL - can return basic success/error

    def status(self) -> RobotConfigStatus:
        """Get the current status of the robot."""
        return RobotConfigStatus(
            name=self.name,
            device_name=f"{self.url}",  # Use URL as device identifier like Go2 uses IP
            robot_type="manipulator"
        )