import {
  Action,
  ActionPanel,
  Clipboard,
  Icon,
  List,
  closeMainWindow,
  getPreferenceValues,
  showHUD,
} from "@raycast/api";
import { ANNUAIRE_URL, bankingFields, LegalField, LEGAL_FIELDS, LegalPreferences, legalKeywords } from "./legal";

export default function Command() {
  const fields = [...LEGAL_FIELDS, ...bankingFields(getPreferenceValues<LegalPreferences>())];

  return (
    <List searchBarPlaceholder="Search legal info, e.g. SIREN, TVA">
      {fields.map((field) => (
        <LegalItem key={field.id} field={field} />
      ))}
    </List>
  );
}

function LegalItem({ field }: { field: LegalField }) {
  return (
    <List.Item
      icon={Icon.Hashtag}
      title={field.label}
      keywords={legalKeywords(field)}
      accessories={[{ text: field.value }]}
      actions={
        <ActionPanel>
          <Action
            title={`Copy ${field.label}`}
            icon={Icon.Clipboard}
            onAction={() => copyAndClose(field.value, field.label)}
          />
          <Action.OpenInBrowser title="Open in Annuaire Des Entreprises" icon={Icon.Globe} url={ANNUAIRE_URL} />
          <Action.CopyToClipboard
            title="Copy Registry Link"
            icon={Icon.Link}
            content={ANNUAIRE_URL}
            shortcut={{ modifiers: ["cmd"], key: "." }}
          />
        </ActionPanel>
      }
    />
  );
}

async function copyAndClose(content: string, label: string) {
  await Clipboard.copy(content);
  await closeMainWindow();
  await showHUD(`Copied ${label} · ${content}`);
}
