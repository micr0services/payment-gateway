// M-Pesa API Response Types
export interface MpesaB2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseDescription: string;
  ResponseCode: string;
}

export interface MpesaC2BResponse {
  ResponseCode: string;
  ResponseDescription: string;
}

export interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaSTKQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface MpesaTokenResponse {
  access_token: string;
  expires_in: number;
}

// Request Types
export interface B2CRequest {
  mobileNumber: string;
  amount: number;
  description?: string;
  callbackUrl?: string;
  cancelUrl?: string;
}

export interface C2BRequest {
  shortCode: string;
  responseType: string;
  confirmationUrl: string;
  validationUrl: string;
}

export interface B2BRequest {
  receiverPartyPublicID: string;
  amount: number;
  description?: string;
  accountReference?: string;
}

export interface STKPushRequest {
  mobileNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
  cancelUrl?: string;
}

export interface STKQueryRequest {
  checkoutRequestId: string;
}

// Reversal request and response types
export interface ReversalRequest {
  transactionId: string;
  amount: number;
  receiverParty: string;
  remarks?: string;
  occasion?: string;
}

export interface MpesaReversalResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

// Callback Types
export interface C2BCallback {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

export interface B2CCallback {
  Result: {
    ResultType: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
    TransactionID: string;
    ResultParameters?: {
      ResultParameter: Array<{
        Key: string;
        Value: string;
      }>;
    };
  };
}

export interface STKCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}
