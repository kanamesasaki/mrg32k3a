x1 = [int(0), int(0), int(1234567)]
x2 = [int(0), int(0), int(1234567)]

m1 = int(4294967087)
m2 = int(4294944443)

a12 = int(1403580)
a13 = int(-810728)

a21 = int(527612)
a23 = int(-1370589)

def step():
    x1i = (x1[1]*a12 + x1[0]*a13) % m1
    x2i = (x2[2]*a21 + x2[0]*a23) % m2
    x1[0] = x1[1]
    x1[1] = x1[2]
    x1[2] = x1i
    x2[0] = x2[1]
    x2[1] = x2[2]
    x2[2] = x2i
    print((x1i - x2i) % m1)
    
for i in range(100):
    step()