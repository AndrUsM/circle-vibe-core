import { EmailServerTemplateName } from "@circle-vibe/shared";

export interface EmailSendParams {
  emails: string[];
  subject: string;
  template: EmailServerTemplateName;
  templateContext: any;
}
