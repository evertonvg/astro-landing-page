/** State for the header's mobile navigation dialog (`x-dialog` is bound with `x-model="open"`). */
export default () => ({
  open: false,
  close() {
    this.open = false;
  },
});
