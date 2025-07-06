import { MailerOptions, TemplateAdapter } from '@nestjs-modules/mailer';
import { inline } from '@css-inline/css-inline';
import * as path from 'path';
import { createEnvironment, createArrayLoader, TwingTemplate, TwingEnvironment } from 'twing';
import { Logger } from '@nestjs/common';

export class TwingAdapter implements TemplateAdapter {
  private logger = new Logger(TwingAdapter.name);
  private precompiledTemplates: Map<string, TwingTemplate> = new Map();

  compile(mail: any, callback: (err?: any, body?: string) => any, options: MailerOptions): void {
    const templateExt = path.extname(mail.data.template) || '.twig';
    const templateName = path.basename(mail.data.template, templateExt);
    const templateDir = options.template?.dir ?? path.dirname(mail.data.template);
    const loader = createArrayLoader({ [templateName + templateExt]: templateDir });
    const twing = createEnvironment(loader);

    this.renderTemplate(twing, templateName + templateExt, mail.data.context)
      .then((html) => {
        mail.data.html = html;

        return callback();
      })
      .catch(callback);
  }

  private async renderTemplate(
    twing: TwingEnvironment,
    template: string,
    context: Record<string, any>,
  ): Promise<string> {
    if (!this.precompiledTemplates.has(template))
      this.precompiledTemplates.set(template, await twing.loadTemplate(template));

    const templateInstance = this.precompiledTemplates.get(template);
    if (!templateInstance) {
      this.logger.error('Template not found');
      return '';
    }

    const rendered = await templateInstance.render(context);

    return inline(rendered, {});
  }
}
