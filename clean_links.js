const fs = require('fs');

const pages = [
  { oldLink: '/viral.html', newLink: '/viral' },
  { oldLink: '/offline.html', newLink: '/offline' },
  { oldLink: '/performance.html', newLink: '/performance' },
  { oldLink: '/design.html', newLink: '/design' },
  { oldLink: '/index.html', newLink: '/' }
];

const basePath = 'c:/Users/wjdgn/Desktop/mycode/adcode/';

const filesToUpdate = [
  'index.html',
  'components/header.html',
  'components/footer-contact.html',
  'viral.html',
  'offline.html',
  'performance.html',
  'design.html'
];

filesToUpdate.forEach(file => {
  const filePath = basePath + file;
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    pages.forEach(p => {
      // 주석이나 다른 텍스트에 영향을 미치지 않도록 href="..." 내부의 값만 정밀하게 교체합니다.
      const regex = new RegExp('href=\"' + p.oldLink + '\"', 'g');
      content = content.replace(regex, 'href=\"' + p.newLink + '\"');
    });
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Internal links updated to Clean URLs (no .html)');
