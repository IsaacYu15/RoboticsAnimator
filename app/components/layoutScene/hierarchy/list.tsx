"use client";

import { Component } from "@/shared-types";
import SearchBar from "../../searchBar/searchBar";
import { useState } from "react";
import Item from "./item";

export interface ListProps {
  title: string;
  components: Component[];
}

export default function List(props: ListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComponents =
    searchQuery.length > 0
      ? props.components.filter((component) =>
          component.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : props.components;

  return (
    <div className="bg-white h-screen p-5 flex flex-col">
      <div className="w-full flex flex-row justify-start">
        <h1 className="text-2xl font-bold">{props.title}</h1>
      </div>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      ></SearchBar>

      <div className="flex flex-col gap-2">
        {filteredComponents.map((component) => (
          <Item key={component.id} name={component.name} level={0}></Item>
        ))}
      </div>
    </div>
  );
}
