import AssetThumbnail from "@/app/components/identifiers/assetThumbnail";
import { Asset } from "@/shared-types";
import { Trash2 } from "lucide-react";

interface AssetItemProps {
  asset: Asset;
  onSpawn: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export default function AssetItem({
  asset,
  onSpawn,
  onDelete,
}: AssetItemProps) {
  return (
    <button
      onClick={() => onSpawn(asset)}
      className="w-1/2 rounded-lg py-1 px-2 hover:bg-gray-light-medium group"
    >
      <div className="flex flex-row items-center gap-1 w-full aspect-square relative">
        <div className="flex flex-col gap-1 items-center justify-center">
          <AssetThumbnail type={asset.type ?? undefined} />
          <h5 className="flex-1 text-left">{asset.name}</h5>
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete(asset);
          }}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 hover:text-gray-medium-dark cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
