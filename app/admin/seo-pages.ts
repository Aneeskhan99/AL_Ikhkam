// The fixed public pages whose search tags can be changed in Admin › SEO.
// Programmes are added from the database as "programme:<slug>". Articles keep theirs in the article editor.

export const fixedSeoPages = [
  { key: "home", label: "Home", path: "/" },
  { key: "advisory", label: "Advisory", path: "/advisory" },
  { key: "academy", label: "Academy", path: "/academy" },
  { key: "faculty", label: "Faculty", path: "/faculty" },
  { key: "zakat", label: "Zakat calculator", path: "/zakat" },
  { key: "insights", label: "Insights", path: "/insights" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;
