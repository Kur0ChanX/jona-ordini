import numpy as np, scipy.ndimage as ndi
from PIL import Image, ImageDraw, ImageFont
S='/tmp/claude-0/-home-user-jona-ordini/be8bc7b5-e2cb-58bf-a402-58a8359ee136/scratchpad'
ink=255-np.asarray(Image.open('tools/originale-ynoy.jpg').convert('L')).astype(np.float32)
Y0,Y1=414,476
def piece(x0,x1): return ink[Y0:Y1,x0:x1].copy()
C=piece(1350,1408); O=piece(1408,1474); RP=piece(1474,1576); R=piece(1474,1527); P=piece(1527,1576); AMP=(1290,1349)
def base():
    b=ink.copy(); b[Y0:Y1,1288:1576]=0; return b   # via & e CORP (sotto riga 414 la Y non arriva qui)
def paste(b,p,x,y=Y0,scale=1.0):
    if scale!=1.0:
        im=Image.fromarray(p.astype(np.uint8)); p=np.asarray(im.resize((round(p.shape[1]*scale),round(p.shape[0]*scale)),Image.LANCZOS)).astype(np.float32)
    h,w=p.shape; b[y:y+h,x:x+w]=np.maximum(b[y:y+h,x:x+w],p)
def vA():  # CORP spostato dove iniziava la &, stessa misura
    b=base(); x=1293
    for p in (C,O,RP): paste(b,p,x); x+=p.shape[1]
    return b
def vB():  # CORP più grande, stessa base, occupa lo spazio di &CORP
    b=base(); s=1.22; x=1290; yb=Y1   # baseline invariata
    for p in (C,O,RP):
        h=round(p.shape[0]*s); paste(b,p,x,yb-h,s); x+=round(p.shape[1]*s)
    return b
def vC():  # CORP stessa misura, lettere più distanziate da 1293 a 1573
    b=base(); L=(C,O,R,P); ws=[p.shape[1] for p in L]; gap=(1573-1293-sum(ws))/3; x=1293
    for p in L: paste(b,p,round(x)); x+=p.shape[1]+gap
    return b
def mask(b):
    a=np.clip(b,0,255); c=a[191:747,149:1683]
    im=Image.fromarray(c.astype(np.uint8)).resize((480,174),Image.LANCZOS)
    out=Image.new('L',(496,190),0); out.paste(im,(8,8)); return out
def preview(m,label):
    W,H=640,300; bg=Image.new('RGB',(W,H),(30,26,24))
    big=m.resize((496,190),Image.LANCZOS)
    col=Image.new('RGB',big.size,(221,211,200)); bg.paste(col,((W-496)//2,70),big)
    d=ImageDraw.Draw(bg); F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',40)
    d.text((20,12),label,fill=(255,255,255),font=F); return bg
if __name__=='__main__':
    ims=[preview(mask(ink),'Ora'),preview(mask(vA()),'A'),preview(mask(vB()),'B'),preview(mask(vC()),'C')]
    G=Image.new('RGB',(640,1200)); [G.paste(t,(0,i*300)) for i,t in enumerate(ims)]; G.save(f'{S}/logo-scelta.png')
