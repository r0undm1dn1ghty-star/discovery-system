# qa/_cut.py — вырезает секцию #problem из index.html (одобрено Виктором: «режем главную, оставляя там кто строит»)
p = 'index.html'
s = open(p, encoding='utf-8').read()
a = s.find('<section id="problem">')
b = s.find('</section>', a) + len('</section>')
assert a > 0, 'секция #problem не найдена'
old = s[a:b]
open('qa/removed/block-problem-v2.html', 'w', encoding='utf-8').write(old)
s = s[:a] + s[b:]
# убрать пробельную пустоту между </header> и <main>
s = s.replace('</header>\n<main>', '</header>\n<main>')
open(p, 'w', encoding='utf-8', newline='').write(s)
import re
print('порядок секций:', re.findall(r'<section[^>]*id="([^"]+)"', s))
print('баланс div:', s.count('<div') - s.count('</div>'))
