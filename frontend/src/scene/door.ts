import { fadeIn, fadeOut } from "./animations";

export type Door = {
  showCustomer: (spriteFile: string) => void;
  hideCustomer: () => void;
};

export function createDoor(customerContainer: HTMLElement): Door {
  customerContainer.replaceChildren();
  const img = document.createElement("img");
  img.className = "customer-sprite";
  img.alt = "";
  customerContainer.appendChild(img);

  return {
    showCustomer: (spriteFile: string) => {
      img.src = `/sprites/customers/${spriteFile}`;
      fadeIn(customerContainer, 600);
    },
    hideCustomer: () => fadeOut(customerContainer, 600),
  };
}
