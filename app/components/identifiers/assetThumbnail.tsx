"use client";

import { getObjectType } from "@/app/components/identifiers/componentIcon";
import { OBJECT_TYPE_CONFIG } from "@/shared-types";
import Image from "next/image";

interface AssetThumbnailProps {
  type?: string;
  size?: number;
}

export default function AssetThumbnail({
  type,
  size = 75,
}: AssetThumbnailProps) {
  const objectType = getObjectType(type);

  if (objectType === undefined) {
    return (
      <div
        style={{ width: size, height: size }}
        className="shrink-0 bg-gray-light-medium rounded"
      />
    );
  }

  const thumbnailPath = OBJECT_TYPE_CONFIG[objectType].thumbnail;

  return (
    <Image
      src={thumbnailPath}
      alt={`${type} thumbnail`}
      width={size}
      height={size}
      className="w-full shrink-0 rounded object-contain"
    />
  );
}
