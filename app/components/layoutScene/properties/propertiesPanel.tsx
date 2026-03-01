"use client";

import { Component } from "@/shared-types";
import SearchBar from "../../searchBar/searchBar";
import { RefObject, useState } from "react";
import { PanelRight, SquareArrowRightExit } from "lucide-react";
import IconButton from "../../input/iconButton";
import TabButton from "../../input/tabButton";
import ItemHeirachy from "./itemHeirachy";

export interface PropertiesPanelProps {
  title: string;
  components: Component[];
  selectedComponent: RefObject<number | null>;
}

enum ItemListTab {
  Parts = "parts",
  Assets = "assets",
}

export default function PropertiesPanel(props: PropertiesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<ItemListTab>(ItemListTab.Parts);

  const isPartsActive = currentTab === ItemListTab.Parts;
  const isAssetsActive = currentTab === ItemListTab.Assets;

  const filteredComponents =
    searchQuery.length > 0
      ? props.components.filter((component) =>
          component.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : props.components;

  return (
    <div className="bg-gray-light h-screen py-6">
      <div className="w-full px-6 pb-4 flex flex-col gap-2 border-b border-gray-light-medium">
        <div className="flex flex-row justify-between w-full items-center">
          <IconButton icon={SquareArrowRightExit} onClick={() => {}} />
          <IconButton icon={PanelRight} onClick={() => {}} />
        </div>
        <input
          className="title-input-default w-full text-2xl"
          value={props.title}
          onChange={(e) => {}}
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
        <ItemHeirachy
          components={filteredComponents}
          selectedComponent={props.selectedComponent}
        />
      )}
    </div>
  );
}
