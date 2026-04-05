import { ComponentType } from "@/app/constants/components";
import { roundToDecimals } from "@/app/utils/parse";
import { Component, Transform, UpdateComponentInput } from "@/shared-types";

export abstract class PanelState {
  type: ComponentType;
  name: string;
  colour?: string;
  pin?: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  config?: string;

  constructor(component: Component) {
    this.type = component.type as ComponentType;
    this.name = component.name ?? "";
    this.colour = component.colour ?? undefined;
    this.pin = component.pin ?? undefined;
    this.x = component.x;
    this.y = component.y;
    this.z = component.z;
    this.rotX = component.rot_x;
    this.rotY = component.rot_y;
    this.rotZ = component.rot_z;
    this.config = component.config ?? undefined;
    this.parseConfig(component.config ?? undefined);
  }

  updateTransform(transform: Transform): this {
    this.x = roundToDecimals(transform.x);
    this.y = roundToDecimals(transform.y);
    this.z = roundToDecimals(transform.z);
    this.rotX = roundToDecimals(transform.rotX);
    this.rotY = roundToDecimals(transform.rotY);
    this.rotZ = roundToDecimals(transform.rotZ);
    return this;
  }

  toUpdateInput(): UpdateComponentInput {
    return {
      name: this.name,
      colour: this.colour,
      pin: this.pin,
      config: this.generateConfig(),
      x: this.x,
      y: this.y,
      z: this.z,
      rot_x: this.rotX,
      rot_y: this.rotY,
      rot_z: this.rotZ,
    };
  }

  abstract parseConfig(config?: string): void;
  abstract generateConfig(): string;

  clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export class ServoPanelState extends PanelState {
  pwmMinAngle?: number = 0;
  pwmMaxAngle?: number = 0;

  constructor(component: Component) {
    super(component);
    this.parseConfig(component.config ?? "");
  }

  parseConfig(config: string): void {
    const parsed = JSON.parse(config);
    this.pwmMinAngle = parsed?.pwmMinAngle ?? undefined;
    this.pwmMaxAngle = parsed?.pwmMaxAngle ?? undefined;
  }

  generateConfig(): string {
    return JSON.stringify({
      pwmMinAngle: this.pwmMinAngle,
      pwmMaxAngle: this.pwmMaxAngle,
    });
  }
}

export function createPanelState(component: Component): PanelState {
  const type = component.type as ComponentType;

  switch (type) {
    case ComponentType.SERVO:
      return new ServoPanelState(component);
    default:
      throw new Error(`Unknown component type: ${component.type}`);
  }
}
