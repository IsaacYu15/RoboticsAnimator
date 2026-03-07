"use client";

import { Asset, Component, Direction } from "@/shared-types";
import { PanelRight, SquareArrowRightExit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IconButton from "../../input/iconButton";
import TabButton from "../../input/tabButton";
import SearchBar from "../../searchBar/searchBar";
import PartItemHeirachy from "./partItemHeirachy";
import AssetItemHeirachy from "./assetItemHeirachy";
import { updateAnimation } from "@/app/actions/animations";
import DragResizer from "../../dragHandlers/dragResizer";
import { HORIZ_DRAGGABLE_SECTIONS } from "../../dragHandlers/constants";
import { STATE_MACHINE_ROUTE } from "@/app/constants/routes";

export interface PropertiesPanelProps {
  id: number;
  title: string;
  components: Component[];
  assets: Asset[];

  selectedComponentId: number | null;
  setSelectedComponentId: (id: number) => void;
  onSpawnAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
}

enum ItemListTab {
  Parts = "parts",
  Assets = "assets",
}

export default function PropertiesPanel(props: PropertiesPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");

  const [panelHidden, setPanelHidden] = useState(false);
  const [currentTab, setCurrentTab] = useState<ItemListTab>(ItemListTab.Parts);

  const isPartsActive = currentTab === ItemListTab.Parts;
  const isAssetsActive = currentTab === ItemListTab.Assets;

  useEffect(() => {
    // eslint-disable-next-line
    setTitle(props.title);
  }, [props.title]);

  const filteredComponents =
    searchQuery.length > 0
      ? props.components.filter((component) =>
          component.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : props.components;

  return (
    <>
      {panelHidden ? (
        <div className="py-6 px-6 absolute top-0 left-0">
          <IconButton
            icon={PanelRight}
            onClick={() => {
              setPanelHidden(false);
            }}
          />
        </div>
      ) : (
        <DragResizer
          minDim={HORIZ_DRAGGABLE_SECTIONS}
          dragDirection={Direction.RIGHT}
        >
          <div className="bg-gray-light h-screen py-6">
            <div className="w-full px-6 pb-4 flex flex-col gap-2 border-b border-gray-light-medium">
              <div className="flex flex-row justify-between w-full items-center">
                <IconButton
                  icon={SquareArrowRightExit}
                  onClick={() => router.push(STATE_MACHINE_ROUTE)}
                />
                <IconButton
                  icon={PanelRight}
                  onClick={() => {
                    setPanelHidden(true);
                  }}
                />
              </div>
              <input
                className="title-input-default w-full text-2xl"
                value={title}
                onChange={async (e) => {
                  setTitle(e.target.value);
                  await updateAnimation(props.id, {
                    name: e.target.value,
                  });
                }}
              />
            </div>

            <div className="panel-section-col-default">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              ></SearchBar>

              <div className="flex flex-row gap-2">
                <TabButton
                  text="Parts"
                  active={isPartsActive}
                  onClick={() => setCurrentTab(ItemListTab.Parts)}
                />
                <TabButton
                  text="Assets"
                  active={isAssetsActive}
                  onClick={() => setCurrentTab(ItemListTab.Assets)}
                />
              </div>
            </div>

            {isPartsActive && (
              <PartItemHeirachy
                components={filteredComponents}
                selectedComponentId={props.selectedComponentId}
                setSelectedComponentId={props.setSelectedComponentId}
              />
            )}

            {isAssetsActive && (
              <AssetItemHeirachy
                assets={props.assets}
                onSpawn={props.onSpawnAsset}
                onDelete={props.onDeleteAsset}
              />
            )}
          </div>
        </DragResizer>
      )}
    </>
  );
}
