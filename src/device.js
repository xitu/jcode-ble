class Device {
  constructor({filters = [], optionalServices = []} = {}) {
    this.filters = filters;
    this.optionalServices = optionalServices;
    this._server = null;
    this._mtu = 20;
  }

  get MTU() {
    return this._mtu;
  }

  async connect(rebound = true) {
    if(rebound || !this._device) {
      const {filters, optionalServices} = this;
      const acceptAllDevices = filters.length <= 0;
      const options = {};
      if(acceptAllDevices) options.acceptAllDevices = true;
      else {
        options.filters = filters;
        options.optionalServices = optionalServices;
      }

      const device = await navigator.bluetooth.requestDevice(options);
      device.addEventListener('gattserverdisconnected', () => {
        this._server = null;
        if(typeof CustomEvent === 'function') {
          const e = new CustomEvent('devicedisconnected', {detail: {device: this}});
          window.dispatchEvent(e);
        }
      });
      this._device = device;
    }

    this._server = await this._device.gatt.connect();
    if(typeof CustomEvent === 'function') {
      const e = new CustomEvent('deviceconnected', {detail: {device: this}});
      window.dispatchEvent(e);
    }
    return this;
  }

  async disconnect() {
    await this.server.device.gatt.disconnect();
    this._server = null;
  }

  get server() {
    // if(this._server === null) {
    //   throw new ReferenceError('server is not connected');
    // }
    return this._server;
  }

  get isConnected() {
    return this._server !== null;
  }
}

export {Device};