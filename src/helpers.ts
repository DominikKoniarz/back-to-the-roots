export const getRootElement = () => {
    const root = document.querySelector("#app");

    if (!root || !(root instanceof HTMLDivElement)) {
        throw new Error("Root element not found");
    }

    return root;
};
