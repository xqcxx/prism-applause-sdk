export class PublicKudosSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicKudosSDKError';
  }
}

export class PublicKudosConfigError extends PublicKudosSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'PublicKudosConfigError';
  }
}

export class PublicKudosRequestError extends PublicKudosSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'PublicKudosRequestError';
  }
}

export class PublicKudosResponseError extends PublicKudosSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'PublicKudosResponseError';
  }
}
