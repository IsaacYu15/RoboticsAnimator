import { ComponentType } from "@/app/constants/components";
import { Component, Transform, UpdateComponentInput } from "@/shared-types";

export abstract class PanelState {
  colour: string | null;
  pin: number | null;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  config: string | null;

  constructor(component: Component) {
    this.colour = component.colour;
    this.pin = component.pin;
    this.x = component.x;
    this.y = component.y;
    this.z = component.z;
    this.rotX = component.rot_x;
    this.rotY = component.rot_y;
    this.rotZ = component.rot_z;
    this.config = component.config;
    this.parseConfig(component.config);
  }

  updateTransform(transform: Transform): this {
    this.x = transform.x;
    this.y = transform.y;
    this.z = transform.z;
    this.rotX = transform.rotX;
    this.rotY = transform.rotY;
    this.rotZ = transform.rotZ;
    return this;
  }

  toUpdateInput(): UpdateComponentInput {
    return {
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

  abstract parseConfig(config: string | null): void;
  abstract generateConfig(): string;

  clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export class ServoPanelState extends PanelState {
  pwmMinAngle: number | null = 0;
  pwmMaxAngle: number | null = 0;

  parseConfig(config: string | null): void {
    const parsed = config ? JSON.parse(config) : null;

    this.pwmMinAngle = parsed?.pwmMinAngle ?? null;
    this.pwmMaxAngle = parsed?.pwmMaxAngle ?? null;
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
