import { Asset } from "@/shared-types";
import AssetItem from "./assetItem";

interface AssetItemHeirachyProps {
  assets: Asset[];
  onSpawn: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export default function AssetItemHeirachy({
  assets,
  onSpawn,
  onDelete,
}: AssetItemHeirachyProps) {
  return (
    <div className="w-full px-6 py-4">
      {assets.map((asset) => (
        <AssetItem
          key={asset.id}
          asset={asset}
          onSpawn={onSpawn}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
