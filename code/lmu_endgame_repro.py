"""LMU endgame-run identification: which m reproduces tex L418?
Doc targets: env(a=1)=0.34, cycles(1->20.6)=57, rho_DE(20.6)=2.6e-4,
rho_m=1e-4, H=0.011, env(20.6)=0.004.  Agent(m=1): rho_DE=1.4e-3, H=0.0225."""
import numpy as np
from scipy.integrate import solve_ivp
rho_m0=0.93                      # 3H^2=rho units; rho_DE(a=1)=2.07 -> H(1)=1
def rhs_f(m):
    def rhs(t,y):
        a,A,Ad=y
        H=np.sqrt((rho_m0*a**-3+0.5*Ad*Ad+0.5*m*m*A*A)/3.0)
        return [a*H, Ad, -3.0*H*Ad-m*m*A]
    return rhs
def solve(m,Ai,rtol,mx):
    e1=lambda t,y:y[0]-1.0;  e1.direction=1
    e2=lambda t,y:y[0]-20.6; e2.terminal=True; e2.direction=1
    return solve_ivp(rhs_f(m),[0,2000],[1e-3,Ai,0.0],events=[e1,e2],
                     rtol=rtol,atol=1e-12,dense_output=True,max_step=mx)
rde=lambda m,y:0.5*y[2]*y[2]+0.5*m*m*y[1]*y[1]
def shoot(m):
    lo,hi=0.01,6.0
    for _ in range(38):
        mid=0.5*(lo+hi)
        s=solve(m,mid,3e-7,0.2)
        if rde(m,s.sol(s.t_events[0][0]))<2.07: lo=mid
        else: hi=mid
    return 0.5*(lo+hi)
print(f"{'m':>4} {'env(a=1)':>9} {'cycles':>7} {'rho_DE(20.6)':>12} {'rho_m':>9} {'H(20.6)':>8} {'env_end':>8}")
for m in (1.0,3.0,6.0):
    Ai=shoot(m); s=solve(m,Ai,1e-10,0.01)
    t1,te=s.t_events[0][0],s.t_events[1][0]
    y1,ye=s.sol(t1),s.sol(te)
    env1=np.sqrt(2*rde(m,y1))/m
    tg=np.arange(t1,te,0.004); Ag=s.sol(tg)[1]
    cyc=int(np.sum(np.sign(Ag[1:])*np.sign(Ag[:-1])<0))/2
    r_end=rde(m,ye); rm=rho_m0*ye[0]**-3
    H=np.sqrt((r_end+rm)/3); envE=np.sqrt(2*r_end)/m
    print(f"{m:4.1f} {env1:9.3f} {cyc:7.1f} {r_end:12.2e} {rm:9.2e} {H:8.4f} {envE:8.4f}")
print("doc   0.340    57.0      2.6e-04  1.0e-04   0.0110   0.0040")
print(f"pure a^-3 extrap: rho_DE={2.07*20.6**-3:.2e}, H={np.sqrt((2.07*20.6**-3+rho_m0*20.6**-3)/3):.4f}")
