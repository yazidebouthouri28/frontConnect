@echo off
echo Lancement de l'integration Frontend...
git fetch origin
git checkout -b integrationBranche2 origin/integrationBranche2
git merge AhmedFront
echo Termin ! S'il y a des conflits, ne t'inquiete pas, l'assistant les resoudra.
pause
