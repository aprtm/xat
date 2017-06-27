import { XatPage } from './app.po';

describe('xat App', () => {
  let page: XatPage;

  beforeEach(() => {
    page = new XatPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
