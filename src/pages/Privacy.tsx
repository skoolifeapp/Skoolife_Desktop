import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Politique de confidentialité — Skoolife</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : 23 décembre 2025</p>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <p>
              Skoolife (ci-après « Skoolife », « nous », « notre ») exploite l'application et le site Skoolife (ci-après le « Service »).<br />
              La présente Politique de confidentialité explique quelles données nous collectons, pourquoi, comment nous les utilisons, avec qui nous les partageons, et quels sont vos droits.
            </p>
            <p>
              En utilisant le Service, vous acceptez les pratiques décrites ci-dessous. Sauf définition contraire, les termes de cette Politique ont le même sens que ceux prévus dans nos Conditions d'utilisation.
            </p>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">1) Définitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Données personnelles</strong> : informations permettant d'identifier une personne directement ou indirectement (ex : e-mail).</li>
                <li><strong>Données d'usage</strong> : données techniques et de navigation liées à l'utilisation du Service (ex : logs, pages vues, erreurs).</li>
                <li><strong>Contenu utilisateur</strong> : contenus ajoutés dans Skoolife (matières, examens, événements, notes, fichiers, liens, préférences).</li>
                <li><strong>Cookies</strong> : petits fichiers stockés sur votre appareil permettant notamment de maintenir une session, enregistrer des préférences et mesurer l'audience.</li>
                <li><strong>Responsable de traitement</strong> : entité qui détermine les finalités et moyens du traitement (Skoolife).</li>
                <li><strong>Prestataires / Sous-traitants</strong> : tiers traitant des données pour notre compte (ex : paiement, hébergement).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">2) Données collectées</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2">2.1 Données que vous nous fournissez</h3>
              <p>Selon les fonctionnalités utilisées, nous pouvons collecter :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte</strong> : adresse e-mail, prénom/nom (si renseignés), informations de connexion (mot de passe stocké sous forme chiffrée/« hashée »).</li>
                <li><strong>Profil & organisation</strong> : établissement (optionnel), niveau/formation (optionnel), matières, examens (dates/échéances), objectifs, préférences de révision (créneaux, durée, fréquence, etc.).</li>
                <li><strong>Contenu utilisateur</strong> : événements (cours, révisions, etc.), notes, fichiers importés/téléversés, liens URL ajoutés, contenus associés aux matières/événements.</li>
                <li><strong>Support</strong> : informations transmises lorsque vous contactez Skoolife (messages, pièces jointes, métadonnées utiles au diagnostic).</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">2.2 Données importées (ex : calendrier .ics)</h3>
              <p>Si vous importez un calendrier (ex : fichier .ics) ou utilisez une fonctionnalité d'import, nous pouvons traiter les informations contenues dans le fichier, par exemple :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>titre/nom des événements, dates/heures, descriptions, lieux,</li>
                <li>catégories/labels disponibles dans le fichier,</li>
                <li>métadonnées nécessaires à l'import et à la cohérence du planning.</li>
              </ul>
              <p>Skoolife traite ces données uniquement pour permettre l'import, l'affichage et l'organisation du planning.</p>

              <h3 className="text-lg font-medium mt-4 mb-2">2.3 Données d'usage et données techniques (collecte automatique)</h3>
              <p>Lorsque vous utilisez le Service, nous pouvons collecter automatiquement :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>adresse IP (souvent tronquée selon les outils), date/heure d'accès, logs,</li>
                <li>type d'appareil, système d'exploitation, navigateur, langue,</li>
                <li>identifiants techniques, cookies, données de performance,</li>
                <li>événements d'utilisation (ex : navigation, clics, erreurs applicatives).</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">2.4 Données liées aux paiements (si offre payante)</h3>
              <p>
                Si vous souscrivez à une offre payante, les paiements sont traités via des prestataires (ex : Stripe).<br />
                Skoolife ne stocke pas les données complètes de carte bancaire. Nous pouvons recevoir des informations limitées : statut du paiement, type d'abonnement, dates, identifiants de transaction/facturation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">3) Cookies et technologies similaires</h2>
              <p>Nous utilisons des cookies (ou technologies similaires) pour :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Cookies de session</strong> : fonctionnement du Service et maintien de connexion,</li>
                <li><strong>Cookies de préférences</strong> : mémoriser vos paramètres (ex : mode nuit, préférences),</li>
                <li><strong>Cookies de sécurité</strong> : protection du compte et prévention de fraude,</li>
                <li><strong>Cookies de mesure d'audience / performance</strong> : comprendre l'utilisation et améliorer le Service.</li>
              </ul>
              <p>
                Vous pouvez configurer votre navigateur pour refuser les cookies ou être alerté lors du dépôt.<br />
                Si vous refusez certains cookies, certaines fonctionnalités peuvent être limitées.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">4) Finalités du traitement (pourquoi nous utilisons vos données)</h2>
              <p>Skoolife utilise les données collectées pour :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Créer et gérer votre compte et permettre l'accès au Service,</li>
                <li>Fournir les fonctionnalités principales (matières, examens, planning, import calendrier, stockage de contenus),</li>
                <li>Générer et ajuster votre planning via un algorithme interne, à partir de vos contraintes (disponibilités, échéances, préférences),</li>
                <li>Personnaliser votre expérience (préférences, affichage, organisation),</li>
                <li>Suivre votre progression et proposer des statistiques de suivi,</li>
                <li>Assurer la sécurité du Service (détection d'activités anormales, prévention fraude, logs),</li>
                <li>Fournir le support utilisateur et répondre à vos demandes,</li>
                <li>Améliorer le Service (analyse d'usage, correction de bugs, performance),</li>
                <li>Gérer les abonnements et paiements (si applicable),</li>
                <li>Vous informer des changements importants (mises à jour, sécurité, modifications).</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">Communications</h3>
              <p>Nous pouvons vous envoyer :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>des e-mails strictement nécessaires au Service (sécurité, compte, modifications importantes),</li>
                <li>et, si vous l'acceptez, des e-mails d'informations/actualités (vous pouvez vous désinscrire à tout moment via le lien de désabonnement).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">5) Base légale (RGPD)</h2>
              <p>Si vous êtes dans l'Espace Économique Européen (EEE), nous traitons vos données sur les bases suivantes :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Exécution du contrat</strong> : fournir Skoolife (compte, planning, import, stockage, fonctionnalités).</li>
                <li><strong>Consentement</strong> : certains cookies, certaines communications non essentielles.</li>
                <li><strong>Intérêt légitime</strong> : sécurité, prévention de fraude, amélioration du Service, statistiques (dans la limite de vos droits).</li>
                <li><strong>Obligation légale</strong> : obligations comptables/fiscales et conformité à la loi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">6) Conservation des données</h2>
              <p>Nous conservons vos données :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>tant que votre compte est actif et que cela est nécessaire au Service,</li>
                <li>puis, si vous supprimez votre compte, pendant une durée limitée selon :
                  <ul className="list-disc pl-6 mt-1">
                    <li>obligations légales (ex : facturation),</li>
                    <li>gestion des litiges,</li>
                    <li>exigences de sécurité.</li>
                  </ul>
                </li>
              </ul>
              <p className="mt-2">En général :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Données de compte & contenu utilisateur</strong> : conservés jusqu'à suppression par vous / suppression de compte (sous réserve d'obligations légales).</li>
                <li><strong>Données d'usage/logs</strong> : conservées sur une durée plus courte, sauf besoin de sécurité ou obligation légale.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">7) Transferts de données</h2>
              <p>
                Vos données peuvent être traitées en France et/ou dans l'Union européenne.<br />
                Selon les prestataires utilisés, certaines données peuvent être transférées hors de l'UE. Dans ce cas, nous mettons en place des garanties appropriées (ex : clauses contractuelles types ou mécanismes équivalents) pour assurer un niveau de protection conforme au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">8) Partage et divulgation des données</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2">8.1 Prestataires (sous-traitants)</h3>
              <p>Nous pouvons faire appel à des prestataires pour :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Hébergement et stockage,</li>
                <li>Mesure d'audience / performance,</li>
                <li>Support (outil de ticketing, e-mail),</li>
                <li>Paiements (ex : Stripe).</li>
              </ul>
              <p>Ces prestataires n'accèdent aux données que dans la mesure nécessaire et sont tenus par des obligations de confidentialité et de sécurité.</p>

              <h3 className="text-lg font-medium mt-4 mb-2">8.2 Transaction commerciale</h3>
              <p>
                En cas de fusion, acquisition, réorganisation ou vente d'actifs, vos données peuvent être transférées.<br />
                Nous vous informerons lorsque requis, avant qu'un changement de politique ne s'applique.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">8.3 Obligations légales</h3>
              <p>Nous pouvons divulguer des données si nous estimons de bonne foi que cela est nécessaire pour :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>respecter une obligation légale,</li>
                <li>protéger nos droits, notre sécurité ou celle des utilisateurs,</li>
                <li>prévenir ou enquêter sur une fraude ou un incident,</li>
                <li>répondre à une demande valide d'autorité publique.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">9) Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité raisonnables et adaptées : contrôles d'accès, chiffrement lorsque pertinent, surveillance, sauvegardes, prévention des intrusions, etc.<br />
                Aucune transmission ou stockage n'étant totalement sécurisé, nous ne pouvons garantir une sécurité absolue.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">10) Vos droits (RGPD)</h2>
              <p>Si vous résidez dans l'EEE, vous disposez notamment des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Accès à vos données,</li>
                <li>Rectification,</li>
                <li>Suppression,</li>
                <li>Limitation du traitement,</li>
                <li>Opposition (notamment aux traitements fondés sur l'intérêt légitime),</li>
                <li>Portabilité de vos données,</li>
                <li>Retrait du consentement à tout moment (lorsque le traitement repose sur le consentement).</li>
              </ul>
              <p>Nous pouvons vous demander une preuve d'identité pour éviter toute demande frauduleuse.</p>
              <p>Vous avez aussi le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente (en France : CNIL).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">11) Liens vers des sites tiers</h2>
              <p>
                Le Service peut contenir des liens vers des sites, ressources ou services tiers.<br />
                Nous ne contrôlons pas leurs pratiques et ne sommes pas responsables de leurs politiques. Nous vous invitons à consulter leur politique de confidentialité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">12) Confidentialité des mineurs</h2>
              <p>
                Skoolife n'est pas destiné aux enfants de moins de 13 ans.<br />
                Nous ne collectons pas sciemment de données personnelles d'enfants de moins de 13 ans sans consentement parental.<br />
                Si vous pensez qu'un enfant nous a transmis des données personnelles, contactez-nous pour que nous puissions les supprimer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">13) Modifications de cette Politique</h2>
              <p>
                Nous pouvons mettre à jour cette Politique.<br />
                En cas de changement important, nous vous informerons via le Service et/ou par e-mail. La date de mise à jour sera modifiée en haut du document.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">14) Nous contacter</h2>
              <p>
                Pour toute question, demande ou exercice de vos droits :<br />
                <a href="mailto:skoolife.co@gmail.com" className="text-primary hover:underline">skoolife.co@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
