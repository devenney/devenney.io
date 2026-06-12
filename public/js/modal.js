const modal = document.getElementById('modal-easter-egg');
const trigger = document.querySelector('[data-target="modal-easter-egg"]');

if (trigger && modal) {
  trigger.addEventListener('dblclick', () => modal.showModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}
