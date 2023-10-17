import { React } from "react";
import SimpleTabs from "./tabPreferences";

export default function Preferences(props) {
  return (
    <>
      <SimpleTabs
        permissions={props.permissions}
        setSearchResult={props.setSearchResult}
        searchResult={props.searchResult}
      />
    </>
  );
}
