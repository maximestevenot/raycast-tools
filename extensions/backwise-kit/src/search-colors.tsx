import { Action, ActionPanel, Clipboard, Icon, List, showHUD, closeMainWindow } from "@raycast/api";
import {
  BrandColor,
  colorTitle,
  cssVariableName,
  cssVariableReference,
  groupByCategory,
  searchKeywords,
  swatchTint,
} from "./colors";

export default function Command() {
  const groups = groupByCategory();

  return (
    <List searchBarPlaceholder="Search colors, e.g. neutral 200">
      {groups.map((group) => (
        <List.Section key={group.category} title={group.title} subtitle={`${group.colors.length}`}>
          {group.colors.map((color) => (
            <ColorItem key={cssVariableName(color)} color={color} />
          ))}
        </List.Section>
      ))}
    </List>
  );
}

function ColorItem({ color }: { color: BrandColor }) {
  const title = colorTitle(color);

  return (
    <List.Item
      title={title}
      keywords={searchKeywords(color)}
      icon={{ source: Icon.CircleFilled, tintColor: swatchTint(color) }}
      accessories={[{ text: color.hex }]}
      actions={
        <ActionPanel>
          <Action title="Copy Hex Code" icon={Icon.Clipboard} onAction={() => copyAndClose(color.hex, title)} />
          <Action
            title="Copy CSS Variable"
            icon={Icon.Code}
            shortcut={{ modifiers: ["cmd"], key: "." }}
            onAction={() => copyAndClose(cssVariableReference(color), title)}
          />
          <Action.CopyToClipboard
            title="Copy CSS Variable Name"
            content={cssVariableName(color)}
            shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
          />
        </ActionPanel>
      }
    />
  );
}

async function copyAndClose(content: string, title: string) {
  await Clipboard.copy(content);
  await closeMainWindow();
  await showHUD(`Copied ${title} · ${content}`);
}
