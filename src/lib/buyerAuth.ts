// Lightweight localStorage-based "auth" for buyer accounts.
// NOTE: This is NOT secure — anyone can inspect/edit localStorage.
// Suitable only for internal demos / prototypes.

export type BuyerAccount = {
  id: string;
  username: string;
  password: string;
  companyName: string;
  role: "buyer" | "manager";
  createdAt: string;
};

const ACCOUNTS_KEY = "pn_buyer_accounts";
const SESSION_KEY = "pn_buyer_session";

export const getAccounts = (): BuyerAccount[] => {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveAccounts = (accounts: BuyerAccount[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const addAccount = (data: Omit<BuyerAccount, "id" | "createdAt">) => {
  const accounts = getAccounts();
  if (
    accounts.some(
      (a) => a.username.toLowerCase() === data.username.toLowerCase(),
    )
  ) {
    throw new Error("Username already exists");
  }
  const account: BuyerAccount = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  saveAccounts(accounts);
  return account;
};

export const removeAccount = (id: string) => {
  saveAccounts(getAccounts().filter((a) => a.id !== id));
};

export const login = (
  username: string,
  password: string,
): BuyerAccount | null => {
  const uname = username.trim();

  // 2. Fall back to dynamically-added accounts
  const account = getAccounts().find(
    (a) =>
      a.username.toLowerCase() === uname.toLowerCase() &&
      a.password === password,
  );
  if (account) {
    localStorage.setItem(SESSION_KEY, account.id);
    return account;
  }
  return null;
};

export const logout = () => localStorage.removeItem(SESSION_KEY);

export const getCurrentBuyer = (): BuyerAccount | null => {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  if (id.startsWith("hc-")) {
    try {
      const raw = localStorage.getItem(`pn_buyer_hc_${id}`);
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return getAccounts().find((a) => a.id === id) || null;
};
