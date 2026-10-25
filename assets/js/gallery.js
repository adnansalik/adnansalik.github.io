(function () {
  function init() {
    const dialog = document.querySelector("dialog.lightbox");
    if (!dialog) return;

    const image = dialog.querySelector(".lightbox-image");
    const closeButton = dialog.querySelector(".lightbox-close");
    const prevButton = dialog.querySelector(".lightbox-prev");
    const nextButton = dialog.querySelector(".lightbox-next");

    let gallery = null;
    let index = 0;

    const triggers = () =>
      gallery ? Array.from(gallery.querySelectorAll(".gallery-trigger")) : [];

    function show(i) {
      const items = triggers();
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const trigger = items[index];
      image.src = trigger.dataset.src;
      image.alt = trigger.dataset.alt || "";
      dialog.classList.toggle("lightbox--single", items.length < 2);
    }

    function open(trigger) {
      gallery = trigger.closest(".gallery");
      show(triggers().indexOf(trigger));
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
        dialog.classList.add("lightbox--fallback");
      }
      document.body.classList.add("lightbox-open");
    }

    function close() {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        dialog.classList.remove("lightbox--fallback");
      }
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
    }

    document.addEventListener("click", function (event) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest(".gallery-trigger");
      if (!trigger) return;
      event.preventDefault();
      open(trigger);
    });

    closeButton.addEventListener("click", close);
    prevButton.addEventListener("click", () => show(index - 1));
    nextButton.addEventListener("click", () => show(index + 1));

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        show(index + 1);
      }
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
