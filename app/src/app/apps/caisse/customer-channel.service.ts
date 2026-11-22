import { Injectable } from '@angular/core';

export interface CustomerScreenLine {
  readonly name: string;
  readonly qty: number;
  readonly price: number;
}

/** What the customer display shows: the ticket in progress, its total, and a short message. */
export interface CustomerScreenState {
  readonly lines: readonly CustomerScreenLine[];
  readonly total: number;
  readonly message: string;
}

export const EMPTY_CUSTOMER_SCREEN: CustomerScreenState = { lines: [], total: 0, message: '' };

const CHANNEL_NAME = 'marketpos-caisse';

/**
 * Sends the cashier's ticket to the customer display, which runs in another window of the same app.
 */
@Injectable({ providedIn: 'root' })
export class CustomerChannelService {
  private readonly sender = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);

  publish(state: CustomerScreenState): void {
    this.sender?.postMessage(state);
  }

  /** Listens for states sent by the cashier window. Returns a function that stops listening. */
  listen(onState: (state: CustomerScreenState) => void): () => void {
    if (typeof BroadcastChannel === 'undefined') {
      return () => undefined;
    }
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<CustomerScreenState>) => onState(event.data);
    return () => channel.close();
  }
}
