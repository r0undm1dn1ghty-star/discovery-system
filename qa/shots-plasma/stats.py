
import json,sys
from PIL import Image
T=(17,21,36)
for arg in sys.argv[1:]:
    d=json.load(open(arg,encoding="utf-8"))
    im=Image.open(arg[:-5]+".png").convert("RGB"); px=im.load()
    vals=[]
    for (x,y) in d["empty"]:
        acc=[0,0,0]; n=0
        for dy in (-1,0,1):
            for dx in (-1,0,1):
                p=px[min(max(x+dx,0),im.width-1),min(max(y+dy,0),im.height-1)]
                for k in range(3): acc[k]+=p[k]
                n+=1
        vals.append(tuple(round(v/n) for v in acc))
    mean=[round(sum(v[k] for v in vals)/len(vals)) for k in range(3)]
    mn=[min(v[k] for v in vals) for k in range(3)]; mx=[max(v[k] for v in vals) for k in range(3)]
    out=sum(1 for v in vals if any(abs(v[k]-T[k])>12 for k in range(3)))
    print(f"{arg.split(chr(47))[-1]:28s} points={len(vals):3d} mean={tuple(mean)} min={tuple(mn)} max={tuple(mx)} out+-12={out}")
