from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import shutil
D=Path("dist");D.mkdir(exist_ok=True)
for p in ["index.html","verification.svg"]: shutil.copy(p,D/p)
GREEN="#143F32"; GOLD="#E2B86B"; CREAM="#F7F6EE"; INK="#192F28"; MUTED="#4C6B5E"
def f(n,b=False):
    try:return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans"+("-Bold" if b else "")+".ttf",n)
    except OSError:return ImageFont.load_default(size=n)
def text(d,xy,s,n,fill=INK,b=False):d.text(xy,s,font=f(n,b),fill=fill)
def rr(d,box,r,fill,outline=None,w=1):d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)
im=Image.new("RGB",(1200,675),GREEN);d=ImageDraw.Draw(im)
for r in range(520,0,-32):
    d.ellipse((1020-r,330-r,1020+r,330+r),outline="#1C4C3B",width=2)
rr(d,(60,52,350,99),23,"#245642");text(d,(81,65),"PAKSIGHTS  /  EDUCATION",17,"#E4EDE5",True)
text(d,(62,157),"HEC USAT",79,"#FFFFFF",True);text(d,(66,251),"December 2026",49,GOLD,True)
text(d,(66,327),"Undergraduate admission test",26,"#D6E8DD")
text(d,(66,371),"Dates, syllabus & preparation",26,"#D6E8DD")
rr(d,(66,480,480,576),15,"#255542");text(d,(90,497),"13 DEC 2026",33,"#FFFFFF",True);text(d,(92,541),"Scheduled test date",19,"#D4E8DB")
# Editorial illustration: examination sheet, stacked books, pencil and checkmark.
rr(d,(739,133,1071,549),24,"#0E3227");rr(d,(721,115,1053,531),23,CREAM)
rr(d,(809,96,965,144),14,GOLD);text(d,(754,177),"USAT",45,GREEN,True);text(d,(756,236),"TEST PREPARATION",17,MUTED,True)
for y in [299,351,403]:
    rr(d,(756,y,784,y+28),5,"#DDE7DC")
    d.line((763,y+13,770,y+20,782,y+4),fill=GREEN,width=4)
    rr(d,(803,y+7,1007,y+16),4,"#C4D4C9")
rr(d,(831,470,1014,503),12,"#DCE8DD");text(d,(851,477),"100 MARKS",17,GREEN,True)
d.polygon([(1080,277),(1111,284),(1049,535),(1024,561),(1019,527)],fill=GOLD)
text(d,(66,624),"Independent study guide  •  Confirm details with HEC / ETC",18,"#C8DDD0")
im.save(D/"usat-december-2026-cover.png",optimize=True)
im=Image.new("RGB",(1000,1120),CREAM);d=ImageDraw.Draw(im)
d.rectangle((0,0,1000,241),fill=GREEN);text(d,(55,35),"PAKSIGHTS  /  EXAM GUIDE",22,GOLD,True)
text(d,(55,91),"HEC USAT 2026",57,"white",True);text(d,(55,167),"December examination timeline",30,"#D8E7DB")
for i,(date,label,note) in enumerate([("04 DEC","Roll number slip","Expected"),("13 DEC","Test day","Scheduled"),("31 DEC","Results","Expected")]):
    y=269+i*126;rr(d,(48,y,952,y+106),17,"white","#D5E3D8",2)
    rr(d,(65,y+17,270,y+89),13,GREEN if i==1 else "#E4EEE5")
    text(d,(84,y+32),date,32,"white" if i==1 else GREEN,True)
    text(d,(296,y+19),label,31,INK,True);text(d,(297,y+62),note+"  •  2026",20,MUTED)
text(d,(53,665),"Paper pattern",36,GREEN,True);text(d,(55,717),"100 marks   /   140 minutes",29,MUTED)
colors=["#2B7452","#699A7D","#BC914A","#526E91"];parts=[20,25,30,25];x=55
for count,c in zip(parts,colors):
    w=round(890*count/100);d.rectangle((x,778,x+w,810),fill=c);x+=w
for i,(label,n,c) in enumerate(zip(["Verbal reasoning","Quantitative reasoning","Subject questions","Essay writing"],parts,colors)):
    y=839+(i//2)*70;x=55+(i%2)*455
    rr(d,(x,y+8,x+22,y+30),4,c);text(d,(x+34,y),label,20,INK,True);text(d,(x+34,y+30),str(n)+" marks",18,MUTED)
d.line((55,993,945,993),fill="#CBD9CE",width=2);text(d,(55,1018),"Dates may change. Check the official ETC portal.",21,MUTED)
text(d,(55,1059),"Independent editorial illustration  •  Paksights",18,MUTED)
im.save(D/"usat-december-2026-infographic.png",optimize=True)
(D/"_headers").write_text("/*\n  X-Robots-Tag: noindex\n")
for p in D.glob("*.png"):
    with Image.open(p) as check:check.verify()
    assert p.stat().st_size>10000
    print(p.name,p.stat().st_size)
